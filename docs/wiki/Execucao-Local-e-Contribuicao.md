# Execução local e contribuição

[← Início](Home) · Anterior: [Segurança e privacidade](Seguranca-e-Privacidade)

## Pré-requisitos

- Node.js 20 ou superior (testado com Node 24) e npm 10+.
- Internet na primeira execução: o MongoDB Memory Server baixa o binário do MongoDB (~70 MB) e o
  guarda em cache. Nenhum serviço externo ou cadastro é necessário.

## Executar

```bash
npm install
```

```bash
npm run dev
```

| Serviço    | Endereço                       |
| ---------- | ------------------------------ |
| Site       | http://localhost:5173          |
| API        | http://localhost:3333/api      |
| Swagger UI | http://localhost:3333/api-docs |

Sem `backend/.env`, a API usa o MongoDB em memória: os dados somem quando ela reinicia. Para usar um
banco persistente localmente, defina `MONGODB_URI` em `backend/.env` (nunca no repositório). Os
exemplos de configuração estão em `backend/.env.example` e `frontend/.env.example`.

### Usuários demonstrativos (só local)

Três usuários fictícios (`@example.com`) podem ser criados no ambiente local. As senhas vêm das
variáveis `DEMO_USER_*_PASSWORD` do `backend/.env` (ver "Dados de demonstração" no `README.md`).
Se uma variável ficar vazia, o usuário correspondente não é criado, e nenhuma senha é gerada ou
exibida no terminal. Também é possível criar uma conta pela tela de cadastro. Em ambiente publicado esses
usuários nunca são criados.

## Verificações antes de abrir um pull request

```bash
npm run lint
```

```bash
npm run format:check
```

```bash
npm run build
```

```bash
npm test
```

```bash
npx playwright install chromium
```

```bash
npm run test:e2e
```

## Como contribuir

1. Abra uma Issue descrevendo o problema ou a proposta. Para defeitos, siga o padrão de
   [Gestão de defeitos](Gestao-de-Defeitos-Riscos-e-Rastreabilidade).
2. Crie uma branch a partir de `main` com prefixo de tipo: `feat/`, `fix/` ou `chore/`.
3. Use mensagens de commit no formato `tipo: descrição` (por exemplo,
   `fix: alinha os cards da credencial`).
4. Inclua testes: toda correção de defeito ganha um teste de regressão que falha sem a correção.
5. Abra o pull request com contexto, causa, solução, testes executados e riscos. Não use
   `Closes #` para defeitos: a Issue é encerrada depois do reteste.
6. Aguarde o CI e a revisão. O merge e a publicação são feitos pela responsável pelo projeto.

### Cuidados

- Não versione `.env`, URIs de banco, senhas, tokens ou dados pessoais. Use `example.com` em dados
  de teste.
- Não descreva soluções de missões em Issues, pull requests ou documentação pública, exceto quando
  indispensável para um defeito de conteúdo.
- Regras de negócio (RN01–RN08), contratos da API e pontuação só mudam com necessidade comprovada e
  atualização do README, do OpenAPI e dos testes.
