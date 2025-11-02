# Sistema de Chat - Documentação para Frontend

Este documento descreve todos os endpoints e funcionalidades do sistema de chat integrado entre acompanhantes e clientes.

## Visão Geral

O sistema de chat permite comunicação em tempo real entre o cliente que fez uma reserva e a acompanhante. Cada booking (agendamento) tem uma conversa exclusiva associada.

**Base URL**: `http://localhost:3000/api`

**WebSocket Namespace**: `/messages`

---

## 🔐 Autenticação

Todos os endpoints REST requerem autenticação JWT:

```
Authorization: Bearer <token>
```

Para WebSocket, o token deve ser enviado na conexão:
```javascript
const socket = io('http://localhost:3000/messages', {
  auth: { token: 'seu_jwt_token' }
});
```

---

## 📡 Endpoints REST

### 1. Criar/Obter Conversa

Cria uma nova conversa para um booking ou retorna a existente.

```
POST /messages/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_id": "uuid-do-booking"
}
```

**Resposta (200/201)**:
```json
{
  "id": "uuid-da-conversa",
  "client_id": "uuid-cliente",
  "escort_id": "uuid-escort",
  "booking_id": "uuid-do-booking",
  "last_message_at": "2024-01-15T10:30:00Z",
  "is_active": true,
  "created_at": "2024-01-15T08:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "client": { ... },
  "escort": { ... },
  "booking": { ... }
}
```

---

### 2. Obter Conversa por Booking ID

Obtém uma conversa pelo ID do booking (cria automaticamente se não existir).

```
GET /messages/conversations/booking/:bookingId
Authorization: Bearer <token>
```

**Resposta (200)**:
```json
{
  "id": "uuid-da-conversa",
  "client_id": "uuid-cliente",
  "escort_id": "uuid-escort",
  "booking_id": "uuid-do-booking",
  "last_message_at": "2024-01-15T10:30:00Z",
  "is_active": true,
  "client": { ... },
  "escort": { ... },
  "booking": { ... }
}
```

---

### 3. Listar Conversas do Usuário

Lista todas as conversas do usuário autenticado (tanto como cliente quanto como acompanhante).

```
GET /messages/conversations?limit=20&offset=0
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit` (opcional, padrão: 20): Número máximo de conversas
- `offset` (opcional, padrão: 0): Offset para paginação

**Resposta (200)**:
```json
{
  "conversations": [
    {
      "id": "uuid",
      "client_id": "uuid",
      "escort_id": "uuid",
      "booking_id": "uuid",
      "last_message_at": "2024-01-15T10:30:00Z",
      "is_active": true,
      "client": {
        "id": "uuid",
        "email": "cliente@example.com",
        "first_name": "João",
        "last_name": "Silva",
        "avatar_url": "https://..."
      },
      "escort": {
        "id": "uuid",
        "email": "escort@example.com",
        "first_name": "Maria",
        "last_name": "Santos",
        "avatar_url": "https://..."
      },
      "booking": {
        "id": "uuid",
        "scheduled_date": "2024-01-20T14:00:00Z",
        "status": "CONFIRMED",
        ...
      }
    }
  ],
  "total": 5
}
```

---

### 4. Obter Conversa Específica

Obtém detalhes de uma conversa específica.

```
GET /messages/conversations/:conversationId
Authorization: Bearer <token>
```

**Resposta (200)**:
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "escort_id": "uuid",
  "booking_id": "uuid",
  "last_message_at": "2024-01-15T10:30:00Z",
  "is_active": true,
  "client": { ... },
  "escort": { ... },
  "booking": { ... },
  "messages": [...]
}
```

---

### 5. Enviar Mensagem

Envia uma mensagem em uma conversa.

```
POST /messages/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversation_id": "uuid-da-conversa",
  "content": "Olá! Tudo bem?",
  "message_type": "TEXT",
  "metadata": {}
}
```

**Campos**:
- `conversation_id` (obrigatório): ID da conversa
- `content` (obrigatório): Conteúdo da mensagem
- `message_type` (opcional): `TEXT`, `IMAGE`, ou `SYSTEM` (padrão: `TEXT`)
- `metadata` (opcional): Metadados adicionais (ex: URL da imagem se `message_type` for `IMAGE`)

**Resposta (201)**:
```json
{
  "id": "uuid-da-mensagem",
  "conversation_id": "uuid-da-conversa",
  "sender_id": "uuid-remetente",
  "content": "Olá! Tudo bem?",
  "message_type": "TEXT",
  "is_read": false,
  "read_at": null,
  "metadata": {},
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "sender": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "João",
    "last_name": "Silva",
    "avatar_url": "https://..."
  },
  "conversation": { ... }
}
```

---

### 6. Listar Mensagens de uma Conversa

Lista as mensagens de uma conversa com paginação.

```
GET /messages/conversations/:conversationId/messages?limit=50&offset=0
Authorization: Bearer <token>
```

**Query Parameters**:
- `limit` (opcional, padrão: 50): Número máximo de mensagens
- `offset` (opcional, padrão: 0): Offset para paginação

**Resposta (200)**:
```json
{
  "messages": [
    {
      "id": "uuid",
      "conversation_id": "uuid",
      "sender_id": "uuid",
      "content": "Olá!",
      "message_type": "TEXT",
      "is_read": true,
      "read_at": "2024-01-15T10:31:00Z",
      "metadata": {},
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "sender": {
        "id": "uuid",
        "email": "user@example.com",
        "first_name": "João",
        "last_name": "Silva",
        "avatar_url": "https://..."
      }
    }
  ],
  "total": 25
}
```

**Nota**: As mensagens são retornadas em ordem cronológica (mais antigas primeiro).

---

### 7. Marcar Mensagens como Lidas

Marca mensagens como lidas.

```
PUT /messages/mark-read
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversation_id": "uuid-da-conversa",
  "message_ids": ["uuid-1", "uuid-2"] // Opcional: se não fornecido, marca todas como lidas
}
```

**Resposta (200)**:
```json
{
  "updated": 3
}
```

---

### 8. Contar Mensagens Não Lidas (Geral)

Conta todas as mensagens não lidas do usuário.

```
GET /messages/unread-count
Authorization: Bearer <token>
```

**Resposta (200)**:
```json
{
  "unread_count": 5
}
```

---

### 9. Contar Mensagens Não Lidas por Conversa

Conta mensagens não lidas de uma conversa específica.

```
GET /messages/conversations/:conversationId/unread-count
Authorization: Bearer <token>
```

**Resposta (200)**:
```json
{
  "unread_count": 2
}
```

---

## 🔌 WebSocket Events

### Conexão

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000/messages', {
  auth: {
    token: 'seu_jwt_token'
  }
});

socket.on('connect', () => {
  console.log('Conectado ao WebSocket de mensagens');
});

socket.on('disconnect', () => {
  console.log('Desconectado');
});
```

---

### Eventos que o Cliente Envia

#### 1. Enviar Mensagem

```javascript
socket.emit('send_message', {
  conversation_id: 'uuid-da-conversa',
  content: 'Olá! Como você está?',
  message_type: 'TEXT', // Opcional: 'TEXT', 'IMAGE', 'SYSTEM'
  metadata: {} // Opcional
});

// Resposta esperada
socket.on('message_sent', (data) => {
  console.log('Mensagem enviada com sucesso:', data);
  // data.message contém a mensagem criada
});
```

**Resposta de sucesso**:
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "conversation_id": "uuid",
    "sender_id": "uuid",
    "content": "Olá! Como você está?",
    "message_type": "TEXT",
    "is_read": false,
    "created_at": "2024-01-15T10:30:00Z",
    "sender": { ... }
  }
}
```

**Resposta de erro**:
```json
{
  "error": "Mensagem de erro"
}
```

---

#### 2. Marcar Mensagens como Lidas

```javascript
socket.emit('mark_read', {
  conversation_id: 'uuid-da-conversa',
  message_ids: ['uuid-1', 'uuid-2'] // Opcional
});

// Resposta
socket.on('mark_read_response', (data) => {
  console.log('Mensagens marcadas como lidas:', data);
});
```

---

#### 3. Entrar em uma Conversa

Entra na sala da conversa para receber atualizações em tempo real.

```javascript
socket.emit('join_conversation', {
  conversation_id: 'uuid-da-conversa'
});

socket.on('join_conversation_response', (data) => {
  console.log('Entrou na conversa:', data);
});
```

---

#### 4. Sair de uma Conversa

```javascript
socket.emit('leave_conversation', {
  conversation_id: 'uuid-da-conversa'
});
```

---

### Eventos que o Cliente Recebe

#### 1. Nova Mensagem Recebida

Disparado quando uma nova mensagem é recebida.

```javascript
socket.on('new_message', (data) => {
  console.log('Nova mensagem:', data);
  // data.message contém a mensagem
  // data.conversation_id contém o ID da conversa
  
  // Atualizar a UI com a nova mensagem
});
```

**Estrutura do evento**:
```json
{
  "message": {
    "id": "uuid",
    "conversation_id": "uuid",
    "sender_id": "uuid",
    "content": "Olá!",
    "message_type": "TEXT",
    "is_read": false,
    "created_at": "2024-01-15T10:30:00Z",
    "sender": { ... }
  },
  "conversation_id": "uuid"
}
```

---

#### 2. Mensagem Enviada (Confirmação)

Confirmação de que sua mensagem foi enviada com sucesso.

```javascript
socket.on('message_sent', (data) => {
  console.log('Mensagem enviada:', data);
  // data.message contém a mensagem criada
});
```

---

#### 3. Conversa Atualizada

Disparado quando há atualizações na conversa (nova mensagem, etc).

```javascript
socket.on('conversation_updated', (data) => {
  console.log('Conversa atualizada:', data);
  // data.conversation_id contém o ID da conversa
  
  // Recarregar a lista de conversas ou atualizar a UI
});
```

---

#### 4. Mensagens Marcadas como Lidas

Notifica que mensagens foram marcadas como lidas pelo outro participante.

```javascript
socket.on('messages_read', (data) => {
  console.log('Mensagens lidas:', data);
  // data.conversation_id
  // data.read_by contém o ID do usuário que leu
  
  // Atualizar o status das mensagens na UI
});
```

---

## 📱 Exemplo de Implementação Completa

### Exemplo React com Socket.io

```javascript
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

function ChatComponent({ conversationId, token }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Conectar ao WebSocket
    const newSocket = io('http://localhost:3000/messages', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Conectado');
      // Entrar na conversa
      newSocket.emit('join_conversation', { conversation_id: conversationId });
    });

    // Escutar novas mensagens
    newSocket.on('new_message', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    // Escutar confirmação de envio
    newSocket.on('message_sent', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    setSocket(newSocket);

    // Carregar histórico de mensagens via REST
    fetch(`http://localhost:3000/api/messages/conversations/${conversationId}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setMessages(data.messages));

    return () => {
      newSocket.emit('leave_conversation', { conversation_id: conversationId });
      newSocket.disconnect();
    };
  }, [conversationId, token]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit('send_message', {
      conversation_id: conversationId,
      content: newMessage,
      message_type: 'TEXT'
    });

    setNewMessage('');
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}>
            <p>{msg.content}</p>
            <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Digite sua mensagem..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
}
```

---

## 🔍 Fluxo Típico de Uso

### 1. Usuário cria um booking
```javascript
POST /bookings/create
// Retorna booking com ID
```

### 2. Criar/Obter conversa do booking
```javascript
GET /messages/conversations/booking/:bookingId
// Retorna ou cria a conversa
```

### 3. Conectar ao WebSocket e entrar na conversa
```javascript
const socket = io('/messages', { auth: { token } });
socket.emit('join_conversation', { conversation_id });
```

### 4. Carregar histórico de mensagens
```javascript
GET /messages/conversations/:conversationId/messages
```

### 5. Enviar mensagens via WebSocket
```javascript
socket.emit('send_message', {
  conversation_id,
  content: 'Olá!'
});
```

### 6. Marcar mensagens como lidas
```javascript
socket.emit('mark_read', {
  conversation_id,
  message_ids: ['uuid-1', 'uuid-2'] // Opcional
});
```

---

## ⚠️ Tratamento de Erros

### Erros Comuns

**401 Unauthorized**: Token inválido ou expirado
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden**: Usuário não tem permissão para acessar a conversa
```json
{
  "statusCode": 403,
  "message": "You do not have permission to access this conversation"
}
```

**404 Not Found**: Conversa ou booking não encontrado
```json
{
  "statusCode": 404,
  "message": "Conversation not found"
}
```

**400 Bad Request**: Dados inválidos ou conversa inativa
```json
{
  "statusCode": 400,
  "message": "This conversation is no longer active"
}
```

---

## 📊 Tipos de Mensagem

- **TEXT**: Mensagem de texto normal
- **IMAGE**: Mensagem com imagem (URL no `metadata.image_url`)
- **SYSTEM**: Mensagem do sistema (ex: "Booking confirmado")

---

## 💡 Dicas de Implementação

1. **Sempre verificar se a conversa existe** antes de tentar enviar mensagens
2. **Implementar reconexão automática** do WebSocket em caso de desconexão
3. **Cachear histórico de mensagens** localmente para melhor performance
4. **Atualizar contador de não lidas** periodicamente ou via WebSocket
5. **Mostrar indicador de digitação** (opcional, pode ser implementado via WebSocket)
6. **Persistir mensagens offline** e sincronizar quando reconectar

---

## 🔒 Segurança

- ✅ Apenas cliente e acompanhante do booking podem conversar
- ✅ Validação de permissões em todos os endpoints
- ✅ Autenticação JWT obrigatória
- ✅ Cada conversa está vinculada a um booking específico
- ✅ Mensagens não podem ser editadas ou deletadas (apenas enviadas)

---

## 📝 Notas Importantes

1. **Cada booking tem apenas uma conversa** - ela é criada automaticamente na primeira consulta
2. **A conversa não é deletada** quando o booking é cancelado - ela apenas fica `is_active: false`
3. **Mensagens são ordenadas cronologicamente** (mais antigas primeiro no histórico)
4. **WebSocket é opcional** - você pode usar apenas REST API se preferir
5. **Não há limite de mensagens** por conversa, mas recomendamos paginação

---

## 🚀 Próximos Passos

1. Implementar notificações push quando mensagem chega
2. Adicionar suporte a arquivos/imagens
3. Implementar indicador de "digitando..."
4. Adicionar busca de mensagens
5. Implementar mensagens com expiração (opcional)

---

**Versão**: 1.0.0  
**Última atualização**: Janeiro 2024

