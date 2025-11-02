# 🔧 Troubleshooting - Docker Build Issues

Este documento ajuda a resolver problemas comuns de build do Docker no Easy Panel.

## ❌ Erro: "Requisição Inválida - exit code 1"

### Possíveis causas:

1. **Módulos nativos (bcrypt)**
2. **Dependências do TypeScript**
3. **pnpm ou Node.js**
4. **Falta de dependências do sistema**

## ✅ Solução 1: Verificar Logs

No Easy Panel, sempre verifique os logs completos do build. O erro exato normalmente aparece nos logs.

## ✅ Solução 2: Build Local (Primeiro)

Antes de fazer deploy, teste o build localmente:

```bash
# 1. Clone o repositório
git clone <seu-repo>
cd fatal-model-backend

# 2. Build com Docker
docker build -t fatal-model-backend .

# 3. Se der erro, veja a mensagem exata
```

## ✅ Solução 3: Problema com Bcrypt

Se o erro for relacionado ao bcrypt:

### Alpine Linux + bcrypt

O bcrypt precisa de compiladores nativos. O Dockerfile já está configurado com:

```dockerfile
RUN apk add --no-cache python3 make g++
```

Se ainda der erro, use Node standard (não Alpine):

```dockerfile
FROM node:22 AS builder
```

## ✅ Solução 4: Versão do pnpm

Se houver problema com o pnpm, especifique uma versão no Dockerfile:

```dockerfile
RUN npm install -g pnpm@latest
```

## ✅ Solução 5: Cache do Docker

Limpe o cache antes do build:

No Easy Panel:
- Marque "Skip Cache" ou "No Cache"

Localmente:
```bash
docker build --no-cache -t fatal-model-backend .
```

## ✅ Solução 6: Variáveis de Ambiente

Certifique-se de que todas as variáveis estão definidas no Easy Panel antes do build.

## ✅ Solução 7: Build Simplificado

Se continuar dando erro, tente este Dockerfile simplificado:

```dockerfile
# Build stage
FROM node:22 AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile && npm install -g @nestjs/cli

COPY . .
RUN pnpm run build

# Production stage
FROM node:22-slim

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist /app/dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**Diferenças:**
- Node 22 (não Alpine) - evita problemas com módulos nativos
- Node 22-slim em produção (menor que Alpine completo)
- Sem dependências de sistema adicionais

## ✅ Solução 8: Usar npm ao invés de pnpm

Se o pnpm continuar dando problemas, use npm:

```dockerfile
# Build stage
FROM node:22 AS builder

WORKDIR /app

COPY package.json ./
RUN npm ci && npm install -g @nestjs/cli

COPY . .
RUN npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

COPY package.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist /app/dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

E remova `pnpm-lock.yaml` do `.dockerignore` se existir.

## 🔍 Debug do Build

### Ver logs em tempo real:

```bash
docker build --progress=plain -t fatal-model-backend . 2>&1 | tee build.log
```

### Entrar no container durante build:

```bash
docker run -it fatal-model-backend /bin/sh
```

### Verificar se dist/ foi criado:

```bash
docker run --rm fatal-model-backend ls -la dist/
```

## 📝 Checklist

Antes de fazer deploy, verifique:

- [ ] Build funciona localmente (`docker build`)
- [ ] Container inicia localmente (`docker run`)
- [ ] Health check funciona (`curl http://localhost:3000/health`)
- [ ] Todas as variáveis de ambiente estão definidas
- [ ] `.dockerignore` não está excluindo arquivos necessários
- [ ] `pnpm-lock.yaml` está no repositório
- [ ] Logs não mostram erros de compilação TypeScript

## 🆘 Ainda não funciona?

1. **Verifique os logs completos** no Easy Panel
2. **Copie a mensagem de erro completa**
3. **Teste localmente** com `docker build`
4. **Compare** com configurações que funcionam
5. **Abra uma issue** com:
   - Mensagem de erro completa
   - Versão do Node.js
   - Sistema operacional
   - Logs completos

## 📚 Recursos

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [NestJS Deployment](https://docs.nestjs.com/recipes/deployment)
- [Easy Panel Docs](https://docs.easypanel.io)

