# Fatal Model Backend - Setup Guide

## Descrição

Backend robusto e escalável para um sistema tipo "Fatal Model" desenvolvido com Nest.js, PostgreSQL, Redis e WebSockets.

## Requisitos

- Node.js 22+
- Docker e Docker Compose
- pnpm (ou npm)

## Instalação

### 1. Clonar o repositório

```bash
git clone <repository-url>
cd fatal-model-backend
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

Copie o ficheiro `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o ficheiro `.env` com suas configurações.

## Executar a Aplicação

### Opção 1: Com Docker Compose (Recomendado)

```bash
docker-compose up -d
```

Isto irá:
- Iniciar PostgreSQL na porta 5432
- Iniciar Redis na porta 6379
- Iniciar a aplicação na porta 3000

### Opção 2: Localmente com serviços externos

#### Iniciar PostgreSQL

```bash
docker run -d --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fatal_model_db \
  -p 5432:5432 \
  postgres:15-alpine
```

#### Iniciar Redis

```bash
docker run -d --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

#### Executar a aplicação

```bash
pnpm run start:dev
```

## Endpoints Principais

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Logout

### Usuários
- `GET /users/profile` - Obter perfil do usuário
- `PUT /users/profile` - Atualizar perfil
- `GET /users/:id` - Obter usuário por ID

### Perfis
- `POST /profiles` - Criar perfil (acompanhantes)
- `GET /profiles/my-profile` - Obter meu perfil
- `GET /profiles/:id` - Obter perfil por ID
- `PUT /profiles/my-profile` - Atualizar perfil
- `POST /profiles/photos` - Adicionar fotos
- `PUT /profiles/pix-key` - Atualizar chave PIX

### Pagamentos
- `POST /payments/create` - Criar pagamento PIX
- `GET /payments/:id` - Obter pagamento
- `PUT /payments/:id/confirm-payment` - Confirmar pagamento
- `GET /payments/history` - Histórico de pagamentos

### Busca
- `GET /search/escorts` - Buscar acompanhantes
- `GET /search/keyword` - Buscar por palavra-chave
- `GET /search/top-rated` - Acompanhantes mais bem avaliadas

### IA
- `POST /ai/recommend` - Obter recomendações (Me Surpreenda)
- `GET /ai/recommendations/history` - Histórico de recomendações

### Agendamentos
- `POST /bookings/create` - Criar agendamento
- `PUT /bookings/:id/confirm` - Confirmar agendamento
- `GET /bookings/upcoming` - Agendamentos futuros
- `GET /bookings/history` - Histórico de agendamentos

### Avaliações
- `POST /reviews/create` - Criar avaliação
- `GET /reviews/escort/:escortId` - Avaliações de uma acompanhante
- `PUT /reviews/:id/response` - Responder avaliação

### Admin
- `GET /admin/dashboard/stats` - Estatísticas do sistema
- `GET /admin/users` - Listar usuários
- `PUT /admin/users/:id/verify` - Verificar perfil
- `PUT /admin/users/:id/suspend` - Suspender usuário
- `GET /admin/reports/payments` - Relatório de pagamentos

### Health Check
- `GET /health` - Status da aplicação
- `GET /health/ready` - Verificar se pronto
- `GET /health/live` - Verificar se vivo

## Documentação Swagger

Acesse a documentação interativa em:

```
http://localhost:3000/api/docs
```

## WebSockets

Conectar ao servidor WebSocket:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'seu_jwt_token'
  }
});

socket.on('notification', (data) => {
  console.log('Notificação recebida:', data);
});
```

## Estrutura do Projeto

```
src/
├── common/              # Código comum (guards, filters, services)
│   ├── decorators/      # Decorators customizados
│   ├── filters/         # Exception filters
│   ├── guards/          # Auth guards
│   ├── middleware/      # Middleware global
│   ├── services/        # Serviços comuns
│   └── controllers/     # Controllers comuns
├── config/              # Configurações da aplicação
├── database/            # Entidades e módulo de banco de dados
│   └── entities/        # TypeORM entities
├── modules/             # Módulos de funcionalidades
│   ├── auth/            # Autenticação
│   ├── users/           # Gerenciamento de usuários
│   ├── profiles/        # Perfis de acompanhantes
│   ├── payments/        # Pagamentos PIX
│   ├── search/          # Busca e filtros
│   ├── ai/              # Recomendações com IA
│   ├── bookings/        # Agendamentos
│   ├── reviews/         # Avaliações
│   ├── notifications/   # Notificações e Email
│   └── admin/           # Painel administrativo
├── app.module.ts        # Módulo principal
└── main.ts              # Ponto de entrada

```

## Variáveis de Ambiente

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=fatal_model_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=sua_chave_secreta
JWT_EXPIRATION=3600
JWT_REFRESH_SECRET=sua_chave_refresh
JWT_REFRESH_EXPIRATION=604800

# Application
NODE_ENV=development
APP_PORT=3000
APP_HOST=0.0.0.0

# AWS S3 (opcional)
AWS_ACCESS_KEY_ID=sua_chave
AWS_SECRET_ACCESS_KEY=sua_chave_secreta
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu_bucket

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha
EMAIL_FROM=noreply@fatal-model.com

# OpenAI (para IA)
OPENAI_API_KEY=sua_chave_api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Testes

### Executar testes unitários

```bash
pnpm run test
```

### Executar testes E2E

```bash
pnpm run test:e2e
```

### Cobertura de testes

```bash
pnpm run test:cov
```

## Build para Produção

```bash
pnpm run build
```

Isto irá compilar o TypeScript para a pasta `dist/`.

## Deploy com Docker

### Build da imagem

```bash
docker build -t fatal-model-backend:latest .
```

### Executar container

```bash
docker run -d \
  --name fatal-model-app \
  -p 3000:3000 \
  -e DATABASE_HOST=postgres \
  -e REDIS_HOST=redis \
  fatal-model-backend:latest
```

## Troubleshooting

### Erro de conexão com PostgreSQL

Verifique se:
- PostgreSQL está rodando
- Credenciais estão corretas em `.env`
- Host e porta estão corretos

### Erro de conexão com Redis

Verifique se:
- Redis está rodando
- Host e porta estão corretos em `.env`

### Erro ao enviar emails

Verifique se:
- Configurações SMTP estão corretas
- Credenciais de email estão corretas
- Firewall permite conexão na porta SMTP

## Contribuição

Para contribuir com o projeto:

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o ficheiro LICENSE para detalhes.

## Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email de suporte.
