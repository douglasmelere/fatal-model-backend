# 🔄 IMPORTANTE: Rebuild Necessário no Easy Panel

## ⚠️ Problema

Se você ainda está vendo o erro:
```
Error: The server does not support SSL connections
```

**Isso significa que o Easy Panel está usando um build antigo do código!**

## ✅ Solução: Forçar Rebuild Completo

### No Easy Panel:

1. **Vá em Settings ou Build Configuration**
2. **Force um rebuild completo**:
   - Procure por "Rebuild" ou "Build from scratch"
   - Marque "Clear cache" ou "No cache"
   - Ou delete o container/app e recrie

3. **OU via terminal** (se tiver acesso):
   ```bash
   # No Easy Panel, force rebuild sem cache
   docker-compose build --no-cache app
   ```

### Verificação:

Após o rebuild, verifique nos logs:
- ✅ Deve mostrar a versão nova do código
- ✅ Deve conectar ao banco sem erro de SSL
- ✅ Logs devem mostrar: `[TypeOrmModule] Database connected successfully`

## 🔍 Como saber se está usando código novo:

Verifique os logs do build. Deve aparecer algo como:
```
Step 11/15 : RUN pnpm run build
```

E depois:
```
> nest build
```

Se não aparecer isso, o build não está sendo feito!

## 📝 Checklist:

- [ ] Código foi commitado e pushado
- [ ] Easy Panel detectou novo commit
- [ ] Build foi iniciado (verifique logs)
- [ ] Build completou com sucesso
- [ ] Container foi recriado com novo build
- [ ] Logs mostram conexão ao banco sem erro SSL

## 🆘 Se ainda não funcionar:

1. **Verifique variável de ambiente**:
   ```env
   DATABASE_SSL=false
   ```
   Ou deixe ela **não definida** (undefined)

2. **Verifique se o código foi atualizado**:
   O arquivo `src/database/database.module.ts` linha 27 deve ter:
   ```typescript
   ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
   ```

3. **Force rebuild sem cache** no Easy Panel

4. **Aguarde alguns minutos** após o rebuild para a aplicação reiniciar


