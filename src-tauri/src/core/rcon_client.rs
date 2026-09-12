use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use tokio::sync::Mutex;
use tokio::time::{timeout, Duration};

const SERVERDATA_AUTH: i32 = 3;
const SERVERDATA_AUTH_RESPONSE: i32 = 2;
const SERVERDATA_EXECCOMMAND: i32 = 2;
#[allow(dead_code)]
const SERVERDATA_RESPONSE_VALUE: i32 = 0;

pub struct RconClient {
    stream: Arc<Mutex<Option<TcpStream>>>,
    request_counter: Arc<Mutex<i32>>,
}

impl RconClient {
    pub fn new() -> Self {
        Self {
            stream: Arc::new(Mutex::new(None)),
            request_counter: Arc::new(Mutex::new(10)),
        }
    }

    fn encode_packet(request_id: i32, packet_type: i32, body: &str) -> Vec<u8> {
        let body_bytes = body.as_bytes();
        let length = (4 + 4 + body_bytes.len() + 2) as i32; // id + type + body + 2 null bytes

        let mut packet = Vec::with_capacity((length + 4) as usize);
        packet.extend_from_slice(&length.to_le_bytes());
        packet.extend_from_slice(&request_id.to_le_bytes());
        packet.extend_from_slice(&packet_type.to_le_bytes());
        packet.extend_from_slice(body_bytes);
        packet.push(0x00);
        packet.push(0x00);
        packet
    }

    async fn read_packet(stream: &mut TcpStream) -> Result<(i32, i32, String), String> {
        let mut len_buf = [0u8; 4];
        stream
            .read_exact(&mut len_buf)
            .await
            .map_err(|e| format!("Erro ao ler comprimento do pacote RCON: {}", e))?;
        let length = i32::from_le_bytes(len_buf);

        if length < 10 || length > 100000 {
            return Err(format!("Tamanho inválido de pacote RCON: {}", length));
        }

        let mut data = vec![0u8; length as usize];
        stream
            .read_exact(&mut data)
            .await
            .map_err(|e| format!("Erro ao ler corpo do pacote RCON: {}", e))?;

        let request_id = i32::from_le_bytes(data[0..4].try_into().unwrap());
        let packet_type = i32::from_le_bytes(data[4..8].try_into().unwrap());

        // O corpo termina no primeiro byte nulo
        let body_bytes = &data[8..];
        let null_pos = body_bytes.iter().position(|&b| b == 0).unwrap_or(body_bytes.len());
        let body = String::from_utf8_lossy(&body_bytes[..null_pos]).to_string();

        Ok((request_id, packet_type, body))
    }

    pub async fn connect(&self, host: &str, port: u16, password: &str) -> Result<String, String> {
        let addr = format!("{}:{}", host, port);
        
        let conn_result = timeout(Duration::from_secs(5), TcpStream::connect(&addr)).await;
        let mut stream = match conn_result {
            Ok(Ok(s)) => s,
            Ok(Err(e)) => return Err(format!("Falha ao conectar em {}: {}", addr, e)),
            Err(_) => return Err(format!("Timeout de conexão ao RCON ({})", addr)),
        };

        // Enviar pacote de autenticação
        let auth_id = 1;
        let auth_packet = Self::encode_packet(auth_id, SERVERDATA_AUTH, password);
        stream
            .write_all(&auth_packet)
            .await
            .map_err(|e| format!("Falha ao enviar autenticação RCON: {}", e))?;

        // Ler resposta de autenticação
        let read_result = timeout(Duration::from_secs(5), async {
            loop {
                let (req_id, p_type, _body) = Self::read_packet(&mut stream).await?;
                if p_type == SERVERDATA_AUTH_RESPONSE {
                    if req_id == -1 {
                        return Err("Senha RCON incorreta ou conexão recusada pelo servidor.".to_string());
                    }
                    if req_id == auth_id {
                        return Ok("Autenticado com sucesso no RCON".to_string());
                    }
                }
                // O servidor costuma enviar um pacote tipo 0 (SERVERDATA_RESPONSE_VALUE) antes do tipo 2; ignoramos o tipo 0
            }
        })
        .await;

        match read_result {
            Ok(Ok(msg)) => {
                let mut guard = self.stream.lock().await;
                *guard = Some(stream);
                Ok(msg)
            }
            Ok(Err(e)) => Err(e),
            Err(_) => Err("Timeout aguardando resposta de autenticação do RCON".to_string()),
        }
    }

    pub async fn execute(&self, command: &str) -> Result<String, String> {
        let mut guard = self.stream.lock().await;
        let stream = guard.as_mut().ok_or("RCON não está conectado")?;

        let mut counter = self.request_counter.lock().await;
        *counter += 1;
        let req_id = *counter;

        let cmd_packet = Self::encode_packet(req_id, SERVERDATA_EXECCOMMAND, command);
        stream
            .write_all(&cmd_packet)
            .await
            .map_err(|e| format!("Falha ao enviar comando RCON: {}", e))?;

        let read_result = timeout(Duration::from_secs(5), async {
            let (_r_id, _p_type, body) = Self::read_packet(stream).await?;
            Ok(body)
        })
        .await;

        match read_result {
            Ok(Ok(response)) => Ok(response),
            Ok(Err(e)) => Err(e),
            Err(_) => Err("Timeout aguardando resposta do comando RCON".to_string()),
        }
    }

    pub async fn disconnect(&self) {
        let mut guard = self.stream.lock().await;
        *guard = None;
    }

    pub async fn is_connected(&self) -> bool {
        let guard = self.stream.lock().await;
        guard.is_some()
    }
}
