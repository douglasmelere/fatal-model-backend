# 🚀 Guia de Deploy - Easy Panel

Este guia irá te ajudar a fazer o deploy do Fatal Model Backend no Easy Panel.

## 📋 Pré-requisitos

- Conta no Easy Panel
- Domínio configurado (opcional, mas recomendado)
- Acesso ao seu servidor

## 🔧 Configuração no Easy Panel

### 1. Criar Nova Aplicação

1. Acesse seu painel do Easy Panel
2. Clique em **"New Application"** ou **"Nova Aplicação"**
3. Selecione **"Docker Compose"** como tipo de aplicação

### 2. Configurar Repositório

- **Nome**: `fatal-model-backend`
- **Tipo**: Docker Compose
- **Branch**: `main` ou `master`
- **Build Pack**: Docker Compose

### 3. Configurar Docker Compose

Use o arquivo `docker-compose.prod.yml` que está no repositório:

```bash
# No Easy Panel, configure para usar docker-compose.prod.yml
```

### 4. Configurar Variáveis de Ambiente

No painel do Easy Panel, adicione as seguintes variáveis de ambiente:

#### Obrigatórias

```env
# Database - ⚠️ IMPORTANTE: Use 'postgres' como host, NÃO 'localhost'!
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_segura_aqui
DATABASE_NAME=fatal_model_db
DATABASE_SSL=false
RUN_MIGRATIONS=true

# Redis - ⚠️ IMPORTANTE: Use 'redis' como host, NÃO 'localhost'!
REDIS_HOST=redis
REDIS_PORT=6379

# Application
NODE_ENV=production

# JWT
JWT_SECRET=uma_chave_super_secreta_aleatoria_long
JWT_EXPIRATION=3600
JWT_REFRESH_SECRET=outra_chave_super_secreta_aleatoria_long
JWT_REFRESH_EXPIRATION=604800

# CORS (ajuste com seu domínio)
CORS_ORIGIN=https://seu-frontend.com,https://www.seu-frontend.com
```

**⚠️ ATENÇÃO**: Se você não configurar `DATABASE_HOST=postgres` e `REDIS_HOST=redis`, a aplicação vai tentar conectar em `localhost` e falhará com `ECONNREFUSED`!

#### Opcionais (se você for usar)

```env
# AWS S3 (para upload de imagens)
AWS_ACCESS_KEY_ID=sua_chave_aws
AWS_SECRET_ACCESS_KEY=sua_chave_secreta_aws
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu-bucket

# Email (para notificações)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_app_google
EMAIL_FROM=noreply@seu-dominio.com

# OpenAI (para recomendações IA)
OPENAI_API_KEY=sua_chave_openai
```

### 5. Configurar Portas

- **Porta Interna**: `3000`
- **Porta Externa**: Configure no Easy Panel conforme necessário

### 6. Configurar Domínio (Recomendado)

1. Vá em **"Domain"** ou **"Domínio"**
2. Adicione seu domínio (ex: `api.seu-dominio.com`)
3. Configure o certificado SSL automático

### 7. Build e Deploy

1. Clique em **"Deploy"** ou **"Build & Deploy"**
2. Aguarde o build completar (pode levar alguns minutos na primeira vez)
3. Verifique os logs para garantir que tudo iniciou corretamente

## 🗄️ Database Migrations

### Migrations Automáticas

As migrations são executadas automaticamente quando:
- `RUN_MIGRATIONS=true` está configurado (padrão em produção)
- A aplicação inicia pela primeira vez

Isso cria:
- Todas as tabelas do banco de dados
- Índices e foreign keys
- Usuário admin inicial (`admin@duoclub.com.br`)

### Verificar Status das Migrations

Para verificar se as migrations foram executadas, verifique os logs da aplicação ou conecte ao banco:

```sql
SELECT * FROM typeorm_migrations;
```

## ✅ Verificação Pós-Deploy

Após o deploy, verifique se tudo está funcionando:

### 1. Health Check

```bash
curl https://seu-dominio.com/health
```

Deve retornar: `{"status":"ok"}`

### 2. Swagger Documentation

Acesse no navegador:
```
https://seu-dominio.com/api/docs
```

### 3. Verificar Migrations

As migrations serão executadas automaticamente na primeira inicialização se `RUN_MIGRATIONS=true` estiver configurado. Isso irá:
- Criar todas as tabelas do banco de dados
- Criar o usuário admin inicial

### 4. Admin Inicial

O sistema cria automaticamente um usuário admin na primeira execução:

- **Email**: `admin@duoclub.com.br`
- **Senha padrão**: `admin123`
- **Status**: Ativo e verificado

> ⚠️ **IMPORTANTE**: Altere a senha padrão imediatamente após o primeiro login!

Para alterar a senha, use o endpoint de alteração de senha ou faça login e atualize via perfil.

### 5. Criar Admin Adicional (Opcional)

Se precisar criar um admin adicional, use o endpoint de debug:

```bash
curl -X POST https://seu-dominio.com/debug/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@duoclub.com.br",
    "password": "SenhaSegura123!",
    "first_name": "Admin",
    "last_name": "DuoClub"
  }'
```

> ⚠️ **Importante**: Após criar admins adicionais, considere remover ou desabilitar os endpoints de debug em produção!

## 🔐 Segurança em Produção

### Deve Fazer

1. **Alterar todas as senhas padrão**
   - `DATABASE_PASSWORD`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`

2. **Configurar CORS corretamente**
   - Não use `*` em produção
   - Liste apenas seus domínios permitidos

3. **Usar HTTPS**
   - Certificado SSL automático do Easy Panel

4. **Backups regulares**
   - Configure backups automáticos do PostgreSQL

### Não Fazer

1. ❌ Não deixe `NODE_ENV=development` em produção
2. ❌ Não exponha portas diretamente (use o proxy reverso do Easy Panel)
3. ❌ Não use senhas fracas
4. ❌ Não armazene `.env` no repositório

## 📊 Monitoramento

### Logs

Acesse os logs em tempo real no Easy Panel:
- Verifique erros no serviço `app`
- Monitore PostgreSQL e Redis

### Health Checks

O Easy Panel irá verificar automaticamente se a aplicação está saudável através do endpoint `/health`.

## 🔄 Updates e Deploy Contínuo

### Para fazer atualizações:

1. Commit suas alterações no Git
2. Push para o branch configurado
3. No Easy Panel, clique em **"Redeploy"**
4. Aguarde o rebuild

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

- Verifique se `DATABASE_HOST` está correto (`postgres` no Docker Compose)
- Verifique se o serviço `postgres` está rodando
- Veja os logs do container `postgres`

### Erro: "Cannot connect to Redis"

- Verifique se `REDIS_HOST` está correto (`redis` no Docker Compose)
- Verifique se o serviço `redis` está rodando
- Veja os logs do container `redis`

### Aplicação não inicia

- Verifique os logs do container `app`
- Verifique se todas as variáveis de ambiente obrigatórias estão configuradas
- Verifique se o build foi bem-sucedido

### Erro 503 ou "Service Unavailable"

- Verifique se todos os serviços estão healthy
- Verifique os health checks
- Aguarde alguns segundos (pode estar iniciando)

## 📝 Notas Importantes

1. **Primeiro Deploy**: Pode levar 5-10 minutos para o primeiro build
2. **Database**: O TypeORM irá criar as tabelas automaticamente na primeira execução
3. **Admin**: Crie o primeiro admin através do endpoint `/debug/create-admin`
4. **Backups**: Configure backups automáticos no Easy Panel
5. **Escala**: Se precisar escalar, adicione mais réplicas do serviço `app` no docker-compose

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no Easy Panel
2. Verifique se todas as variáveis de ambiente estão corretas
3. Verifique a conectividade entre serviços
4. Teste localmente primeiro com `docker-compose up -d`

## 📞 Links Úteis

- [Easy Panel Docs](https://docs.easypanel.io)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [NestJS Documentation](https://docs.nestjs.com)

