# Arquitetura - Fatal Model Backend

## Visão Geral

O Fatal Model Backend é uma aplicação Nest.js escalável e robusta, construída com arquitetura de microserviços, que fornece uma plataforma completa para gerenciar acompanhantes, agendamentos, pagamentos e avaliações.

## Princípios Arquiteturais

1. **Modularidade**: Cada funcionalidade é encapsulada em seu próprio módulo
2. **Separação de Responsabilidades**: Controllers, Services e Repositories bem definidos
3. **Escalabilidade**: Suporte a múltiplos usuários simultâneos com Redis e WebSockets
4. **Segurança**: Autenticação JWT, Rate Limiting e validação de dados
5. **Observabilidade**: Logging estruturado e health checks

## Estrutura de Camadas

### 1. Camada de Apresentação (Controllers)
- Recebem requisições HTTP
- Validam entrada com DTOs
- Delegam lógica aos Services
- Retornam respostas formatadas

### 2. Camada de Negócio (Services)
- Implementam lógica de negócio
- Coordenam múltiplos Repositories
- Tratam exceções específicas
- Implementam regras de negócio

### 3. Camada de Dados (Repositories)
- Interagem com banco de dados via TypeORM
- Executam queries otimizadas
- Gerenciam relacionamentos entre entidades

### 4. Camada de Infraestrutura
- PostgreSQL: Armazenamento de dados persistentes
- Redis: Cache e sessões
- WebSockets: Notificações em tempo real

## Módulos Principais

### Auth Module
**Responsabilidade**: Autenticação e autorização

**Componentes**:
- `AuthService`: Lógica de registro, login, refresh token
- `AuthController`: Endpoints de autenticação
- `JwtStrategy`: Estratégia Passport para JWT

**Fluxo**:
1. Usuário registra com email e senha
2. Senha é hasheada com bcrypt
3. JWT tokens são gerados (access + refresh)
4. Tokens são usados para autenticar requisições

### Users Module
**Responsabilidade**: Gerenciamento de perfil de usuários

**Componentes**:
- `UsersService`: CRUD de usuários
- `UsersController`: Endpoints de usuários

**Funcionalidades**:
- Atualizar perfil
- Gerenciar preferências de notificação
- Suspender/ativar usuários

### Profiles Module
**Responsabilidade**: Perfis de acompanhantes

**Componentes**:
- `ProfilesService`: Gerenciamento de perfis
- `ProfilesController`: Endpoints de perfis

**Funcionalidades**:
- Criar/atualizar perfis
- Gerenciar fotos e PIX
- Atualizar disponibilidade
- Busca avançada

### Payments Module
**Responsabilidade**: Sistema de pagamentos PIX

**Componentes**:
- `PaymentsService`: Lógica de pagamentos
- `PaymentsController`: Endpoints de pagamentos
- `QRCodeService`: Geração de QR codes

**Fluxo**:
1. Cliente cria pagamento
2. QR code PIX é gerado
3. Cliente envia comprovante (opcional)
4. Acompanhante confirma recebimento
5. Pagamento é marcado como confirmado

### Search Module
**Responsabilidade**: Busca e filtros avançados

**Componentes**:
- `SearchService`: Queries otimizadas de busca
- `SearchController`: Endpoints de busca

**Funcionalidades**:
- Busca por localização, idade, preço
- Busca por palavra-chave
- Top rated, most viewed, newest
- Paginação e ordenação

### AI Module
**Responsabilidade**: Recomendações inteligentes ("Me Surpreenda")

**Componentes**:
- `AiService`: Lógica de recomendação
- `AiController`: Endpoints de IA

**Funcionalidades**:
- Análise de descrição textual
- Extração de palavras-chave
- Cálculo de score de confiança
- Histórico de recomendações

### Bookings Module
**Responsabilidade**: Agendamentos

**Componentes**:
- `BookingsService`: Lógica de agendamentos
- `BookingsController`: Endpoints de agendamentos

**Funcionalidades**:
- Criar agendamentos
- Confirmar/cancelar
- Listar agendamentos futuros e histórico

### Reviews Module
**Responsabilidade**: Avaliações e ratings

**Componentes**:
- `ReviewsService`: Lógica de avaliações
- `ReviewsController`: Endpoints de avaliações

**Funcionalidades**:
- Criar avaliações (1-5 stars)
- Responder avaliações
- Atualizar rating médio do perfil

### Notifications Module
**Responsabilidade**: Notificações em tempo real e email

**Componentes**:
- `NotificationsGateway`: WebSocket gateway
- `EmailService`: Serviço de email

**Funcionalidades**:
- WebSocket para notificações em tempo real
- Email para agendamentos, pagamentos, avaliações
- Autenticação JWT para WebSocket

### Admin Module
**Responsabilidade**: Painel administrativo

**Componentes**:
- `AdminService`: Lógica administrativa
- `AdminController`: Endpoints administrativos

**Funcionalidades**:
- Dashboard com estatísticas
- Gerenciamento de usuários
- Verificação de perfis
- Relatórios de pagamentos e agendamentos

## Fluxos de Dados

### Fluxo de Autenticação
```
POST /auth/register
  ↓
AuthController.register()
  ↓
AuthService.register()
  ↓
Hash password com bcrypt
  ↓
Create User entity
  ↓
Generate JWT tokens
  ↓
Return user + tokens
```

### Fluxo de Agendamento
```
POST /bookings/create
  ↓
BookingsController.createBooking()
  ↓
BookingsService.createBooking()
  ↓
Create Appointment entity
  ↓
Send notification to escort
  ↓
Return appointment
```

### Fluxo de Pagamento PIX
```
POST /payments/create
  ↓
PaymentsController.createPayment()
  ↓
PaymentsService.createPayment()
  ↓
Get escort profile + PIX key
  ↓
Generate QR code
  ↓
Create Payment entity
  ↓
Return payment + QR code
```

## Padrões de Design

### 1. Dependency Injection
Todos os serviços são injetados via constructor, facilitando testes e manutenção.

```typescript
constructor(
  private usersRepository: Repository<UserEntity>,
  private emailService: EmailService,
) {}
```

### 2. Repository Pattern
Acesso a dados é abstraído através de repositories.

```typescript
@InjectRepository(UserEntity)
private usersRepository: Repository<UserEntity>
```

### 3. DTO Validation
Todos os inputs são validados com class-validator.

```typescript
export class CreateProfileDto {
  @IsString()
  display_name: string;

  @IsInt()
  @Min(18)
  age: number;
}
```

### 4. Guards e Decorators
Autenticação e autorização via Guards.

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async getAdminData() {}
```

### 5. Exception Filters
Tratamento centralizado de exceções.

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // Handle exception
  }
}
```

## Segurança

### 1. Autenticação
- JWT com access token (3600s) e refresh token (7 dias)
- Senhas hasheadas com bcrypt (10 rounds)

### 2. Autorização
- Role-based access control (CLIENT, ESCORT, ADMIN)
- Guards verificam roles antes de executar endpoints

### 3. Validação
- DTOs com class-validator
- Validação automática com ValidationPipe

### 4. Rate Limiting
- Limite de requisições por IP
- Cabeçalhos X-RateLimit nas respostas

### 5. CORS
- Configurável via variáveis de ambiente
- Suporte a credenciais

## Performance

### 1. Caching
- Redis para cache de queries frequentes
- Session storage em Redis

### 2. Indexação
- Índices em colunas frequentemente consultadas
- Full-text search para busca por palavra-chave

### 3. Paginação
- Limit/offset em todas as listagens
- Evita carregar dados desnecessários

### 4. Query Optimization
- QueryBuilder para queries complexas
- Eager loading com relations

## Escalabilidade

### 1. Microserviços
- Módulos independentes e reutilizáveis
- Fácil adicionar novos módulos

### 2. Horizontal Scaling
- Stateless design (JWT tokens)
- Redis para compartilhar estado entre instâncias

### 3. Load Balancing
- Suporte a múltiplas instâncias
- Docker Compose para orquestração local

### 4. Async Processing
- Bull para job queues (futuro)
- WebSockets para notificações em tempo real

## Monitoramento e Logging

### 1. Logging
- Winston para logging estruturado
- Ficheiros separados para erros e combinado
- Console output em desenvolvimento

### 2. Health Checks
- `/health` - Status geral
- `/health/ready` - Pronto para receber requisições
- `/health/live` - Vivo e respondendo

### 3. Métricas
- Uptime da aplicação
- Contagem de requisições
- Latência de respostas

## Testes

### 1. Unit Tests
- Testes para Services
- Mocks de repositories
- Cobertura > 80%

### 2. E2E Tests
- Testes de endpoints completos
- Banco de dados de teste
- Validação de fluxos

### 3. Integration Tests
- Testes com banco de dados real
- Validação de relacionamentos

## Deployment

### 1. Docker
- Multi-stage build para otimização
- Imagem base Node.js Alpine

### 2. Docker Compose
- Orquestração local com PostgreSQL e Redis
- Health checks automáticos

### 3. Environment Configuration
- Configuração via variáveis de ambiente
- Suporte a múltiplos ambientes (dev, staging, prod)

## Roadmap Futuro

1. **Autenticação Social**: OAuth2 com Google, Facebook
2. **Pagamentos Reais**: Integração com Stripe/PagSeguro
3. **Busca Avançada**: Elasticsearch para full-text search
4. **Machine Learning**: Recomendações baseadas em ML
5. **Internacionalização**: Suporte a múltiplos idiomas
6. **Mobile App**: Aplicativo mobile nativo
7. **Analytics**: Dashboard de analytics avançado
8. **Moderação**: Sistema de moderação automática de conteúdo
