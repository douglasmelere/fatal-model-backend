# ✅ Checklist de Deploy - Easy Panel

Use este checklist para garantir que tudo está pronto para o deploy.

## 📦 Antes do Deploy

### Arquivos Essenciais
- [x] `Dockerfile` - Configurado e otimizado
- [x] `docker-compose.prod.yml` - Configurado para produção
- [x] `.dockerignore` - Ignorando arquivos desnecessários
- [x] `.env.example` - Template de variáveis de ambiente
- [x] `DEPLOY.md` - Guia de deploy completo
- [x] `pnpm-lock.yaml` - Lock file presente

### Configuração do Código
- [x] Código compila sem erros (`npm run build`)
- [x] Sem erros de linting
- [x] Servidor iniciando corretamente
- [x] Health check funcionando (`/health`)
- [x] Swagger documentação acessível (`/api/docs`)

### Variáveis de Ambiente
- [ ] Cria senhas fortes para:
  - [ ] `DATABASE_PASSWORD`
  - [ ] `JWT_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
- [ ] Configura `CORS_ORIGIN` com seu(s) domínio(s)
- [ ] (Opcional) Configura AWS S3 se for usar upload de imagens
- [ ] (Opcional) Configura email se for usar notificações
- [ ] (Opcional) Configura OpenAI se for usar recomendações IA

## 🚀 Durante o Deploy

### Easy Panel Setup
- [ ] Cria nova aplicação no Easy Panel
- [ ] Seleciona "Docker Compose" como tipo
- [ ] Conecta repositório Git
- [ ] Configura branch (main/master)
- [ ] Adiciona todas as variáveis de ambiente
- [ ] Configura domínio (recomendado)
- [ ] Inicia o deploy

### Monitoramento Inicial
- [ ] Verifica logs do build
- [ ] Verifica logs da aplicação
- [ ] Verifica se PostgreSQL iniciou
- [ ] Verifica se Redis iniciou
- [ ] Verifica health check (`/health`)

## ✅ Após o Deploy

### Verificações Funcionais
- [ ] Health check retorna 200 OK
- [ ] Swagger documentation acessível
- [ ] Endpoint `/auth/register` funcionando
- [ ] Endpoint `/auth/login` funcionando
- [ ] Admin pode fazer login

### Criar Primeiro Admin
- [ ] Acessa endpoint `/debug/create-admin`
- [ ] Cria conta admin com email seguro
- [ ] Faz login com admin criado
- [ ] Verifica acesso ao painel admin

### Segurança
- [ ] Remove/desabilita endpoints de debug
- [ ] Verifica que HTTPS está ativo
- [ ] Verifica CORS configurado corretamente
- [ ] Verifica que senhas são fortes

### Backups
- [ ] Configura backups do PostgreSQL
- [ ] Testa restauração do backup
- [ ] Configura backup automático

## 🧪 Testes de Funcionalidades

### Autenticação
- [ ] Registro de novo usuário
- [ ] Login de usuário
- [ ] JWT token funcionando
- [ ] Refresh token funcionando

### Perfis (Escort)
- [ ] Criação de perfil de acompanhante
- [ ] Upload de fotos
- [ ] Edição de perfil

### Admin
- [ ] Lista usuários
- [ ] Verifica perfis pendentes
- [ ] Aprova/rejeita perfis
- [ ] Suspende/ban usuários
- [ ] Vê dashboard de estatísticas

### Busca Pública
- [ ] Lista apenas perfis verificados
- [ ] Não mostra perfis suspensos/banidos
- [ ] Top rated funcionando
- [ ] Most viewed funcionando
- [ ] New profiles funcionando

### Pagamentos (se configurado)
- [ ] Criação de pagamento PIX
- [ ] Geração de QR code
- [ ] Confirmação de pagamento

## 📊 Monitoramento Contínuo

### Semanal
- [ ] Verifica logs de erros
- [ ] Verifica uso de recursos (CPU, RAM)
- [ ] Verifica uso de disco
- [ ] Verifica backups

### Mensal
- [ ] Atualiza dependências
- [ ] Verifica segurança (vulnerabilidades)
- [ ] Revisa logs de acesso
- [ ] Testa disaster recovery

## 🆘 Problemas Comuns

### Se o deploy falhar
- [ ] Verifica logs do Easy Panel
- [ ] Verifica variáveis de ambiente
- [ ] Verifica conectividade (PostgreSQL, Redis)
- [ ] Testa localmente primeiro

### Se a aplicação não iniciar
- [ ] Verifica logs do container `app`
- [ ] Verifica se PostgreSQL está healthy
- [ ] Verifica se Redis está healthy
- [ ] Verifica variáveis de ambiente

### Se houver erros de conexão
- [ ] Verifica `DATABASE_HOST=postgres`
- [ ] Verifica `REDIS_HOST=redis`
- [ ] Verifica network do Docker Compose
- [ ] Verifica health checks

## 📞 Documentação

Mantém referência aos seguintes arquivos:
- `DEPLOY.md` - Guia completo de deploy
- `README.md` - Visão geral do projeto
- `API_DOCUMENTATION.md` - Documentação da API
- `.env.example` - Template de variáveis

## 🎯 Próximos Passos

Após deploy bem-sucedido:
1. Conecta frontend ao backend
2. Configura CI/CD (opcional)
3. Configura monitoramento adicional (opcional)
4. Configura analytics (opcional)
5. Documenta processos internos

---

**Boa sorte com seu deploy! 🚀**

