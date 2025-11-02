# Guia de Contribuição - Fatal Model Backend

Obrigado por considerar contribuir para o Fatal Model Backend! Este documento fornece orientações e instruções para contribuir com o projeto.

## Código de Conduta

Este projeto adota um Código de Conduta que esperamos que todos os contribuidores sigam. Por favor, leia e siga o [Código de Conduta](CODE_OF_CONDUCT.md).

## Como Contribuir

### 1. Reportar Bugs

Antes de criar um bug report, verifique se o problema já não foi reportado. Se você encontrar um bug, crie uma issue com os seguintes detalhes:

- **Título descritivo**: Use um título claro e descritivo
- **Descrição detalhada**: Descreva o comportamento observado e o esperado
- **Passos para reproduzir**: Forneça passos específicos para reproduzir o problema
- **Exemplos específicos**: Forneça exemplos específicos para demonstrar os passos
- **Comportamento observado**: Descreva o comportamento que você observou
- **Comportamento esperado**: Descreva qual comportamento você esperava ver
- **Screenshots**: Se possível, inclua screenshots
- **Ambiente**: Inclua seu sistema operacional, versão do Node.js, etc.

### 2. Sugerir Melhorias

Se você tem uma sugestão de melhoria, crie uma issue com os seguintes detalhes:

- **Título descritivo**: Use um título claro e descritivo
- **Descrição detalhada**: Descreva a melhoria sugerida
- **Justificativa**: Explique por que essa melhoria seria útil
- **Exemplos**: Forneça exemplos de como a melhoria funcionaria

### 3. Pull Requests

Siga estes passos para enviar um pull request:

1. **Fork o repositório**
   ```bash
   git clone https://github.com/seu-usuario/fatal-model-backend.git
   cd fatal-model-backend
   ```

2. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/sua-feature
   ```

3. **Faça suas mudanças**
   - Siga o estilo de código do projeto
   - Adicione testes para novas funcionalidades
   - Atualize a documentação conforme necessário

4. **Commit suas mudanças**
   ```bash
   git commit -m "Descrição clara das mudanças"
   ```

5. **Push para a branch**
   ```bash
   git push origin feature/sua-feature
   ```

6. **Abra um Pull Request**
   - Forneça uma descrição clara das mudanças
   - Referencie qualquer issue relacionada
   - Inclua screenshots se aplicável

## Padrões de Código

### Estilo de Código

- Use TypeScript
- Siga o ESLint configuration do projeto
- Use 2 espaços para indentação
- Use camelCase para variáveis e funções
- Use PascalCase para classes e interfaces

### Exemplo

```typescript
// ✅ Correto
export class UserService {
  constructor(private usersRepository: Repository<UserEntity>) {}

  async getUserById(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

// ❌ Incorreto
export class userService {
  constructor(private users_repository: Repository<UserEntity>) {}

  async get_user_by_id(user_id: string): Promise<UserEntity> {
    const user = await this.users_repository.findOne({
      where: { id: user_id },
    });

    return user;
  }
}
```

### Comentários

- Use comentários para explicar o "por quê", não o "o quê"
- Mantenha comentários atualizados com o código
- Use JSDoc para documentar funções públicas

```typescript
/**
 * Busca um usuário pelo ID
 * @param userId - ID do usuário
 * @returns Usuário encontrado
 * @throws NotFoundException se usuário não existir
 */
async getUserById(userId: string): Promise<UserEntity> {
  // ...
}
```

### Testes

- Escreva testes para toda nova funcionalidade
- Mantenha cobertura de testes > 80%
- Use nomes descritivos para testes

```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = '123';
      const expectedUser = { id: userId, email: 'test@example.com' };

      // Act
      const result = await service.getUserById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const userId = 'non-existent';

      // Act & Assert
      await expect(service.getUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

## Processo de Review

1. **Verificação Automática**: GitHub Actions executará testes e linting
2. **Review Manual**: Pelo menos um mantenedor revisará o código
3. **Discussão**: Comentários e sugestões podem ser feitos
4. **Aprovação**: Uma vez aprovado, o PR será mergeado

## Convenções de Commit

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos

- **feat**: Uma nova funcionalidade
- **fix**: Uma correção de bug
- **docs**: Mudanças na documentação
- **style**: Mudanças que não afetam o significado do código
- **refactor**: Refatoração de código sem mudanças de funcionalidade
- **perf**: Melhorias de performance
- **test**: Adição ou atualização de testes
- **chore**: Mudanças em dependências ou configuração

### Exemplos

```bash
# Feat
git commit -m "feat(auth): add two-factor authentication"

# Fix
git commit -m "fix(payments): resolve PIX QR code generation issue"

# Docs
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(search): optimize database queries"
```

## Estrutura de Branches

- `main`: Branch de produção (stable)
- `develop`: Branch de desenvolvimento
- `feature/*`: Branches para novas funcionalidades
- `bugfix/*`: Branches para correções de bugs
- `hotfix/*`: Branches para correções urgentes em produção

## Processo de Release

1. Criar branch `release/x.y.z` a partir de `develop`
2. Atualizar versão em `package.json`
3. Atualizar `CHANGELOG.md`
4. Fazer merge em `main` com tag de versão
5. Fazer merge de volta em `develop`

## Recursos Úteis

- [Documentação do Nest.js](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Jest Testing Framework](https://jestjs.io/)
- [ESLint Documentation](https://eslint.org/)

## Perguntas?

Se tiver dúvidas, abra uma issue com a tag `question` ou entre em contato com os mantenedores.

Obrigado por contribuir! 🚀
