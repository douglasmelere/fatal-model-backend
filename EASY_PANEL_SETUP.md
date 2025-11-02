# 🚀 Configuração Específica para Easy Panel

## ⚠️ PROBLEMA COMUM: ECONNREFUSED ao PostgreSQL

Se você está vendo este erro:
```
ERROR [TypeOrmModule] Unable to connect to the database. Retrying...
AggregateError [ECONNREFUSED]: connect ECONNREFUSED ::1:5432
```

**Causa**: Variáveis de ambiente não configuradas ou `DATABASE_HOST` está como `localhost`.

## ✅ SOLUÇÃO: Configurar Variáveis de Ambiente

### No Easy Panel:

1. **Vá em Settings > Environment Variables**
2. **Configure estas variáveis OBRIGATÓRIAS**:

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_segura_aqui
DATABASE_NAME=fatal_model_db

REDIS_HOST=redis
REDIS_PORT=6379

NODE_ENV=production

JWT_SECRET=sua_chave_super_secreta_aqui
JWT_EXPIRATION=3600
JWT_REFRESH_SECRET=outra_chave_super_secreta_aqui
JWT_REFRESH_EXPIRATION=604800

CORS_ORIGIN=https://seu-frontend.com
```

### ⚠️ IMPORTANTE:

- `DATABASE_HOST` deve ser `postgres` (nome do serviço), **NÃO** `localhost`
- `REDIS_HOST` deve ser `redis` (nome do serviço), **NÃO** `localhost`
- Todas as variáveis são **OBRIGATÓRIAS** em produção

## 🔧 Configuração do Docker Compose

### Opção 1: Usar docker-compose.prod.yml

No Easy Panel:
1. Configure para usar `docker-compose.prod.yml`
2. Certifique-se que os serviços `postgres`, `redis` e `app` estão no mesmo `network`

### Opção 2: Configuração Manual no Easy Panel

Se o Easy Panel não usar docker-compose automaticamente:

1. **Crie serviços separados**:
   - PostgreSQL (porta interna 5432)
   - Redis (porta interna 6379)
   - App (porta interna 3000)

2. **Configure network**: Todos os serviços devem estar na mesma network

3. **Use nomes de serviço**: `postgres` e `redis` como hosts

## 📝 Checklist Rápido

Antes de fazer deploy, verifique:

- [ ] `DATABASE_HOST=postgres` (não `localhost`)
- [ ] `REDIS_HOST=redis` (não `localhost`)
- [ ] `DATABASE_PASSWORD` definida
- [ ] `JWT_SECRET` definido e forte
- [ ] `JWT_REFRESH_SECRET` definido e forte
- [ ] `NODE_ENV=production`
- [ ] PostgreSQL está rodando
- [ ] Redis está rodando
- [ ] Todos os serviços na mesma network

## 🧪 Testar Conexão

Após configurar, os logs devem mostrar:

```
[Nest] X - XX/XX/XXXX, XX:XX:XX AM   LOG [TypeOrmModule] Database connected successfully
```

**NÃO** deve mostrar:
```
ERROR [TypeOrmModule] Unable to connect to the database
```

## 🔍 Debug

Se ainda não funcionar:

1. **Verifique os logs do PostgreSQL**:
   - Deve estar healthy
   - Deve estar na porta 5432

2. **Verifique os logs do Redis**:
   - Deve estar healthy
   - Deve estar na porta 6379

3. **Teste conectividade**:
   No container da aplicação, teste:
   ```bash
   # Deve funcionar
   ping postgres
   ping redis
   
   # Deve conectar
   nc -zv postgres 5432
   nc -zv redis 6379
   ```

4. **Verifique network**:
   ```bash
   docker network inspect <network_name>
   ```
   Todos os containers devem estar na mesma network.

## 💡 Dica

O Easy Panel pode ter uma interface diferente. Procure por:
- "Environment Variables"
- "Env Vars"
- "Variables"
- "Settings > Environment"

E configure manualmente todas as variáveis listadas acima.

