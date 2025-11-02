# Fatal Model Backend

Um backend robusto, escalável e production-ready para um sistema tipo "Fatal Model" desenvolvido com **Nest.js**, **PostgreSQL**, **Redis** e **WebSockets**.

![Nest.js](https://img.shields.io/badge/nest.js-v10.0.0-red?style=flat-square&logo=nestjs)
![TypeScript](https://img.shields.io/badge/typescript-v5.0.0-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/postgresql-v15-336791?style=flat-square&logo=postgresql)
![Redis](https://img.shields.io/badge/redis-v7-DC382D?style=flat-square&logo=redis)
![Docker](https://img.shields.io/badge/docker-latest-2496ED?style=flat-square&logo=docker)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## 📋 Características

### ✅ Autenticação e Autorização
- Autenticação JWT com access e refresh tokens
- Senhas hasheadas com bcrypt
- Role-based access control (RBAC)
- Guards e decorators customizados

### ✅ Gerenciamento de Usuários e Perfis
- Registro e login de usuários
- Perfis de acompanhantes com fotos e dados
- Gerenciamento de disponibilidade
- Verificação de perfis (admin)

### ✅ Sistema de Pagamentos PIX
- Geração de QR codes PIX
- Confirmação de pagamentos
- Upload de comprovantes
- Histórico de transações

### ✅ Busca e Filtros Avançados
- Busca por localização, idade, preço
- Busca por palavra-chave
- Top rated, most viewed, newest
- Paginação e ordenação

### ✅ Recomendações com IA ("Me Surpreenda")
- Análise de descrição textual
- Extração de palavras-chave
- Score de confiança
- Histórico de recomendações

### ✅ Agendamentos
- Criação e confirmação de agendamentos
- Cancelamento com motivo
- Histórico de agendamentos
- Notificações em tempo real

### ✅ Sistema de Avaliações
- Ratings de 1 a 5 estrelas
- Comentários e respostas
- Cálculo automático de rating médio
- Verificação de compra

### ✅ Notificações
- WebSockets para notificações em tempo real
- Email para agendamentos, pagamentos, avaliações
- Autenticação JWT para WebSocket

### ✅ Painel Administrativo
- Dashboard com estatísticas
- Gerenciamento de usuários
- Relatórios de pagamentos e agendamentos
- Suspensão/banimento de usuários

### ✅ Infraestrutura
- Docker e Docker Compose
- PostgreSQL com TypeORM
- Redis para cache e sessões
- Logging com Winston
- Rate limiting
- Health checks
- Swagger/OpenAPI

## 🚀 Quick Start

### Pré-requisitos
- Node.js 22+
- Docker e Docker Compose
- pnpm (ou npm)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/fatal-model-backend.git
   cd fatal-model-backend
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```

4. **Inicie os serviços com Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Acesse a aplicação**
   - API: http://localhost:3000
   - Swagger: http://localhost:3000/api/docs
   - Health: http://localhost:3000/health

## 📚 Documentação

- [Setup Guide](./SETUP.md) - Instruções de instalação e configuração
- [Architecture](./ARCHITECTURE.md) - Arquitetura e design patterns
- [API Documentation](./API_DOCUMENTATION.md) - Documentação completa da API
- [Contributing](./CONTRIBUTING.md) - Guia de contribuição

## 📁 Estrutura do Projeto

```
fatal-model-backend/
├── src/
│   ├── common/                 # Código comum
│   │   ├── controllers/        # Controllers comuns
│   │   ├── decorators/         # Decorators customizados
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth guards
│   │   ├── middleware/         # Middleware global
│   │   └── services/           # Serviços comuns
│   ├── config/                 # Configurações
│   ├── database/               # Banco de dados
│   │   └── entities/           # TypeORM entities
│   ├── modules/                # Módulos de funcionalidades
│   │   ├── auth/               # Autenticação
│   │   ├── users/              # Usuários
│   │   ├── profiles/           # Perfis
│   │   ├── payments/           # Pagamentos
│   │   ├── search/             # Busca
│   │   ├── ai/                 # IA/Recomendações
│   │   ├── bookings/           # Agendamentos
│   │   ├── reviews/            # Avaliações
│   │   ├── notifications/      # Notificações
│   │   └── admin/              # Admin
│   ├── app.module.ts           # Módulo principal
│   └── main.ts                 # Ponto de entrada
├── docker-compose.yml          # Docker Compose
├── Dockerfile                  # Dockerfile
├── package.json                # Dependências
└── README.md                   # Este ficheiro
```

## 🔧 Variáveis de Ambiente

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

## 🧪 Testes

```bash
# Testes unitários
pnpm run test

# Testes E2E
pnpm run test:e2e

# Cobertura de testes
pnpm run test:cov
```

## 🏗️ Build

```bash
# Build para produção
pnpm run build

# Executar build
pnpm run start:prod
```

## 📊 Endpoints Principais

### Autenticação
- `POST /auth/register` - Registrar
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar token
- `POST /auth/logout` - Logout

### Perfis
- `POST /profiles` - Criar perfil
- `GET /profiles/my-profile` - Meu perfil
- `PUT /profiles/my-profile` - Atualizar perfil

### Pagamentos
- `POST /payments/create` - Criar pagamento
- `GET /payments/:id` - Obter pagamento
- `PUT /payments/:id/confirm-payment` - Confirmar

### Busca
- `GET /search/escorts` - Buscar acompanhantes
- `GET /search/keyword` - Busca por palavra-chave
- `GET /search/top-rated` - Top rated

### IA
- `POST /ai/recommend` - Recomendações

### Agendamentos
- `POST /bookings/create` - Criar agendamento
- `GET /bookings/upcoming` - Futuros agendamentos

### Avaliações
- `POST /reviews/create` - Criar avaliação
- `GET /reviews/escort/:escortId` - Avaliações

### Admin
- `GET /admin/dashboard/stats` - Estatísticas
- `GET /admin/users` - Listar usuários
- `PUT /admin/users/:id/verify` - Verificar perfil

Veja [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) para documentação completa.

## 🔒 Segurança

- Autenticação JWT com tokens seguros
- Senhas hasheadas com bcrypt
- Rate limiting por IP
- CORS configurável
- Validação de entrada com DTOs
- Exception handling global
- SQL injection prevention (TypeORM)

## 📈 Performance

- Paginação em todas as listagens
- Indexação de banco de dados
- Cache com Redis
- Query optimization
- Eager loading com relations
- Compression de respostas

## 🌐 WebSockets

Conecte-se para receber notificações em tempo real:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'seu_jwt_token'
  }
});

socket.on('notification', (data) => {
  console.log('Notificação:', data);
});
```

## 🐳 Docker

### Build da imagem
```bash
docker build -t fatal-model-backend:latest .
```

### Executar com Docker Compose
```bash
docker-compose up -d
```

### Parar os serviços
```bash
docker-compose down
```

## 📝 Logging

Logs são armazenados em:
- `logs/error.log` - Apenas erros
- `logs/combined.log` - Todos os logs
- Console - Em desenvolvimento

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja [LICENSE](./LICENSE) para detalhes.

## 📞 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email de suporte.

## 🎯 Roadmap

- [ ] Autenticação Social (OAuth2)
- [ ] Pagamentos Reais (Stripe/PagSeguro)
- [ ] Elasticsearch para busca avançada
- [ ] Machine Learning para recomendações
- [ ] Internacionalização (i18n)
- [ ] Aplicativo Mobile
- [ ] Analytics avançado
- [ ] Moderação automática

## 👥 Autores

- **Seu Nome** - *Desenvolvimento Inicial*

## 🙏 Agradecimentos

- [Nest.js](https://nestjs.com/) - Framework
- [TypeORM](https://typeorm.io/) - ORM
- [PostgreSQL](https://www.postgresql.org/) - Banco de dados
- [Redis](https://redis.io/) - Cache
- [Socket.io](https://socket.io/) - WebSockets

---

**Desenvolvido com ❤️ usando Nest.js**
