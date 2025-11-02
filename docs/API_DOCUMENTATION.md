# Guia de Implementação Front-end

Este roteiro serve para orientar a equipe de front-end no consumo dos endpoints do backend Fatal Model, organizando a implementação em telas, features e responsabilidades, com base nos endpoints REST documentados em `/api/docs`.

---

## 🔑 1. Autenticação e Registro

### Páginas:
- Login
- Cadastro
- Recuperação de senha (se implementado)

### Check-list:
- [ ] Formulário de login (email + senha)
- [ ] Chamada ao endpoint `/auth/login`, armazenar accessToken/refreshToken
- [ ] Redirect em caso de sucesso, mostrar erro/hint em caso de falha
- [ ] Formulário de cadastro (campos de acordo com `/auth/register`)
- [ ] Chamada ao endpoint `/auth/register` + feedback visual
- [ ] Lidar com roles: CLIENT, ESCORT, ADMIN (campo de seleção, se permitido)
- [ ] Guardar token (em memory/cookie seguro)
- [ ] Middleware/interceptor global para enviar `Authorization: Bearer ...` em todas as requisições autenticadas

---

## 👤 2. Perfil do Usuário

### Páginas:
- Perfil do usuário (visão, edição)
- Preferências de notificação

### Check-list:
- [ ] Buscar dados do usuário autenticado: `/users/profile`
- [ ] Exibir e permitir edição de dados básicos
- [ ] Atualizar perfil com `PUT /users/profile`
- [ ] Editar preferências (push/email/sms) com `/users/notification-preferences`
- [ ] Mostrar papel e status na UI (`role`, `status`)

---

## 🔎 3. Listagem e Busca de Usuários/Escorts

### Páginas:
- Busca de escorts/clientes/admins
- Listagem para admins

### Check-list:
- [ ] Buscar usuários por papel (role): `/users/role/:role`
- [ ] Paginar, filtrar, exibir dados principais (nome, status, etc.)

---

## 📝 4. Gestão de Perfis (Escort)

### Páginas:
- Página pública do perfil de escort
- Edição de perfil do escort (caso você permita update pelo usuário)

### Check-list:
- [ ] Buscar/exibir informações de perfil (/profiles/id ou similar)
- [ ] Exibir informações como: nome de exibição, bio, atributo físico, serviços, fotos, etc.
- [ ] Permitir update de perfil, upload de foto, gerenciamento de serviços/valores (se aplicável)

---

## 🔒 5. Sistema de Pagamento (PIX e outros)

### Páginas:
- Tela de pagamento (PIX checkout)
- Histórico de pagamentos do cliente
- Confirmação de recebimento (escort)
- Envio de comprovante de pagamento

### Check-list:
- [ ] Criar pagamento: `POST /payments/create`
    - Apresentar QR code (base64)
    - Apresentar string copia-e-cola PIX
    - Exibir instruções visuais
- [ ] Visualizar pagamento: `GET /payments/:id`
- [ ] Cliente faz upload de comprovante: `POST /payments/:id/upload-proof`
- [ ] Escort confirma recebimento: `POST /payments/:id/confirm`
- [ ] Listar histórico: `/payments/history`

---

## 📅 6. Agendamentos (Bookings)

### Páginas:
- Nova reserva/agendamento
- Listagem de reservas feitas
- Detalhe de reserva

### Check-list:
- [ ] Seleção de escort, serviço, data/hora
- [ ] Chamar endpoint de criação de booking (ex: `POST /bookings`)
- [ ] Buscar reservas do usuário (cliente/escort)
- [ ] Cancelar reserva (se permitido)

---

## ⭐ 7. Sistema de Reviews e Avaliações

### Páginas:
- Avaliar serviço/agendamento
- Listar/exibir reviews de escort
- Responder review (escort)

### Check-list:
- [ ] Cliente posta review: `POST /reviews`
- [ ] Visualizar lista: `GET /reviews/escort/:id` ou similar
- [ ] Escort responde: `POST /reviews/:id/respond`
- [ ] Campos típicos: nota, comentário, is_anonymous

---

## 🛠️ 8. Admin

### Páginas:
- Painel de administração
- Moderação de usuários (banir, suspender, ativar)
- Listar usuários por role/status

### Check-list:
- [ ] Buscar usuários por role/status (`/users/role/...`)
- [ ] Modificar status do usuário (`/admin/suspend-user` etc. se implementado)
- [ ] Acesso restrito (checar JWT `role: ADMIN`!)

---

## 🌎 9. Outras integrações/opcionais

### Recomendados:
- [ ] Tela de erro global / feedbacks visuais consistentes
- [ ] Interceptor global para tratamento de expiração de token
- [ ] Loader de sessão (ex.: enquanto carrega profile/session do usuário)
- [ ] Notificações integradas à UX
- [ ] Integração com documentação Swagger para devs (UTF-8, ver payloads)

---

## Como saber o shape dos dados?
- Consulte o `/api/docs` (Swagger) do backend (http://localhost:3000/api/docs) para exemplos de uso, parâmetros obrigatórios e tipos de dados.

---

Se desejar um detalhamento campo a campo para cada endpoint, só pedir!

---

# API Documentation - Fatal Model Backend

## Visão Geral

A Fatal Model Backend API é uma RESTful API que fornece endpoints para gerenciar usuários, perfis, pagamentos, agendamentos, avaliações e muito mais.

**Base URL**: `http://localhost:3000/api`

**Documentação Interativa**: `http://localhost:3000/api/docs` (Swagger)

## Autenticação

Todos os endpoints protegidos requerem um token JWT no header `Authorization`:

```
Authorization: Bearer <token>
```

### Obter Token

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Resposta**:
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "CLIENT"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Endpoints

### Authentication

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "CLIENT"
}
```

**Resposta** (201):
```json
{
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```
POST /auth/refresh
Authorization: Bearer <refreshToken>
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <token>
```

### Users

#### Get My Profile
```
GET /users/profile
Authorization: Bearer <token>
```

**Resposta** (200):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "CLIENT",
  "status": "ACTIVE",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Update My Profile
```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+55 11 99999-9999"
}
```

#### Get User by ID
```
GET /users/:id
Authorization: Bearer <token>
```

### Profiles

#### Create Profile (Escort)
```
POST /profiles
Authorization: Bearer <token>
Content-Type: application/json

{
  "display_name": "Bella",
  "age": 25,
  "location": "São Paulo",
  "bio": "Acompanhante profissional",
  "services_offered": ["massage", "company"],
  "pricing": {
    "hourly_rate": 300,
    "two_hours_rate": 500
  },
  "body_type": "curvy",
  "hair_color": "brown"
}
```

**Resposta** (201):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "display_name": "Bella",
  "age": 25,
  "location": "São Paulo",
  "is_verified": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get My Profile
```
GET /profiles/my-profile
Authorization: Bearer <token>
```

#### Get Profile by ID
```
GET /profiles/:id
```

#### Update My Profile
```
PUT /profiles/my-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Updated bio",
  "services_offered": ["massage", "company", "dinner"]
}
```

#### Upload Photos
```
POST /profiles/photos
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

#### Set Main Photo
```
PUT /profiles/main-photo/:photoId
Authorization: Bearer <token>
```

#### Update PIX Key
```
PUT /profiles/pix-key
Authorization: Bearer <token>
Content-Type: application/json

{
  "pix_key": "12345678900",
  "pix_key_type": "CPF"
}
```

### Payments

#### Create Payment
```
POST /payments/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "escort_id": "uuid",
  "amount": 300,
  "description": "Service payment"
}
```

**Resposta** (201):
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "escort_id": "uuid",
  "amount": 300,
  "status": "PENDING",
  "qr_code": "data:image/png;base64,...",
  "pix_copy_paste": "00020126580014br.gov.bcb.pix...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get Payment
```
GET /payments/:id
Authorization: Bearer <token>
```

#### Confirm Payment (Escort)
```
PUT /payments/:id/confirm-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "confirmation_details": "Pagamento recebido"
}
```

#### Upload Payment Proof (Client)
```
PUT /payments/:id/upload-proof
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <proof_image>
```

#### Get Payment History
```
GET /payments/history?limit=10&offset=0
Authorization: Bearer <token>
```

#### Cancel Payment
```
PUT /payments/:id/cancel
Authorization: Bearer <token>
```

### Search

#### Search Escorts
```
GET /search/escorts?location=São Paulo&minAge=18&maxAge=30&minPrice=100&maxPrice=500&limit=10&offset=0
```

**Query Parameters**:
- `location`: Localização
- `minAge`, `maxAge`: Intervalo de idade
- `minPrice`, `maxPrice`: Intervalo de preço
- `services`: Serviços oferecidos (array)
- `bodyType`: Tipo de corpo
- `hairColor`: Cor do cabelo
- `minRating`: Rating mínimo
- `sortBy`: Campo para ordenar (newest, rating, price, views)
- `sortOrder`: ASC ou DESC
- `limit`: Número de resultados
- `offset`: Deslocamento

**Resposta** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "display_name": "Bella",
      "age": 25,
      "location": "São Paulo",
      "average_rating": 4.8,
      "total_views": 150
    }
  ],
  "total": 1
}
```

#### Search by Keyword
```
GET /search/keyword?q=massage&limit=10&offset=0
```

#### Get Top Rated
```
GET /search/top-rated?limit=10
```

#### Get Most Viewed
```
GET /search/most-viewed?limit=10
```

#### Get New Profiles
```
GET /search/new?limit=10
```

### AI Recommendations

#### Get Recommendations
```
POST /ai/recommend
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Procuro alguém para massagem relaxante",
  "location": "São Paulo",
  "budget_range": {
    "min": 200,
    "max": 500
  },
  "filters": {
    "age_range": { "min": 20, "max": 30 },
    "body_type": "curvy",
    "min_rating": 4
  }
}
```

**Resposta** (200):
```json
{
  "recommendations": [ ... ],
  "explanation": "Based on your preferences...",
  "matched_keywords": ["massage", "relaxing"],
  "confidence_score": 85
}
```

#### Get Recommendation History
```
GET /ai/recommendations/history?limit=10&offset=0
Authorization: Bearer <token>
```

#### Provide Feedback
```
POST /ai/feedback
Authorization: Bearer <token>
Content-Type: application/json

{
  "recommendationId": "uuid",
  "rating": 5,
  "feedback": "Excelente recomendação!"
}
```

### Bookings

#### Create Booking
```
POST /bookings/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "escort_id": "uuid",
  "scheduled_date": "2024-02-01T14:00:00Z",
  "duration": 60,
  "service_type": "massage",
  "total_price": 300,
  "location": "Hotel ABC",
  "special_requests": "Preferência por massagem suave"
}
```

**Resposta** (201):
```json
{
  "id": "uuid",
  "client_id": "uuid",
  "escort_id": "uuid",
  "scheduled_date": "2024-02-01T14:00:00Z",
  "duration": 60,
  "status": "PENDING",
  "total_price": 300,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get Booking
```
GET /bookings/:id
Authorization: Bearer <token>
```

#### Confirm Booking (Escort)
```
PUT /bookings/:id/confirm
Authorization: Bearer <token>
```

#### Cancel Booking
```
PUT /bookings/:id/cancel
Authorization: Bearer <token>
```

#### Complete Booking (Escort)
```
PUT /bookings/:id/complete
Authorization: Bearer <token>
```

#### Get Upcoming Bookings
```
GET /bookings/upcoming?limit=10&offset=0
Authorization: Bearer <token>
```

#### Get Booking History
```
GET /bookings/history?limit=10&offset=0
Authorization: Bearer <token>
```

### Reviews

#### Create Review
```
POST /reviews/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "appointment_id": "uuid",
  "rating": 5,
  "comment": "Excelente serviço!",
  "is_anonymous": false
}
```

**Resposta** (201):
```json
{
  "id": "uuid",
  "appointment_id": "uuid",
  "client_id": "uuid",
  "escort_id": "uuid",
  "rating": 5,
  "comment": "Excelente serviço!",
  "is_verified_purchase": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get Review
```
GET /reviews/:id
```

#### Get Escort Reviews
```
GET /reviews/escort/:escortId?limit=10&offset=0
```

#### Respond to Review (Escort)
```
PUT /reviews/:id/response
Authorization: Bearer <token>
Content-Type: application/json

{
  "response": "Obrigada pela avaliação!"
}
```

#### Delete Review
```
DELETE /reviews/:id
Authorization: Bearer <token>
```

### Admin

#### Get Dashboard Stats
```
GET /admin/dashboard/stats
Authorization: Bearer <adminToken>
```

**Resposta** (200):
```json
{
  "total_users": 1000,
  "total_escorts": 200,
  "total_clients": 800,
  "total_payments": 5000,
  "total_bookings": 3000,
  "total_revenue": 1500000
}
```

#### Get All Users
```
GET /admin/users?limit=10&offset=0
Authorization: Bearer <adminToken>
```

#### Verify Profile
```
PUT /admin/users/:id/verify
Authorization: Bearer <adminToken>
```

#### Reject Profile
```
PUT /admin/users/:id/reject
Authorization: Bearer <adminToken>
```

#### Get Payment Reports
```
GET /admin/reports/payments?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <adminToken>
```

#### Get Booking Reports
```
GET /admin/reports/bookings?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <adminToken>
```

#### Suspend User
```
PUT /admin/users/:id/suspend
Authorization: Bearer <adminToken>
```

#### Ban User
```
PUT /admin/users/:id/ban
Authorization: Bearer <adminToken>
```

#### Activate User
```
PUT /admin/users/:id/activate
Authorization: Bearer <adminToken>
```

#### Create Announcement
```
POST /admin/announcements
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "title": "Manutenção Programada",
  "message": "Sistema em manutenção no dia 15/02",
  "type": "maintenance"
}
```

### Health

#### Health Check
```
GET /health
```

**Resposta** (200):
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600,
  "environment": "development"
}
```

#### Readiness Check
```
GET /health/ready
```

#### Liveness Check
```
GET /health/live
```

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `204 No Content`: Requisição bem-sucedida sem conteúdo
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Autenticação necessária
- `403 Forbidden`: Acesso negado
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito (ex: email já existe)
- `429 Too Many Requests`: Limite de requisições excedido
- `500 Internal Server Error`: Erro interno do servidor

## WebSockets

### Conectar
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'seu_jwt_token'
  }
});
```

### Eventos

#### Receber Notificação
```javascript
socket.on('notification', (data) => {
  console.log('Notificação:', data);
  // {
  //   type: 'booking_request',
  //   message: 'Novo agendamento recebido',
  //   data: { ... }
  // }
});
```

#### Desconectar
```javascript
socket.disconnect();
```

## Tratamento de Erros

Todas as respostas de erro seguem este formato:

```json
{
  "statusCode": 400,
  "message": "Descrição do erro",
  "error": "BadRequest"
}
```

## Rate Limiting

O API aplica rate limiting por IP:
- Limite: 100 requisições por 15 minutos
- Headers de resposta:
  - `X-RateLimit-Limit`: Limite total
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp de reset

## Versionamento

A API usa versionamento semântico (MAJOR.MINOR.PATCH):
- Versão atual: 1.0.0
- Mudanças breaking: Novo MAJOR
- Novas funcionalidades: Novo MINOR
- Bug fixes: Novo PATCH
