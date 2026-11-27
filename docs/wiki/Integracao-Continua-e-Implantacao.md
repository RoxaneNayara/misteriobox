# Integração contínua e implantação

[← Início](Home) · Anterior: [Testes automatizados](Testes-Automatizados-e-Ferramentas) · Próxima:
[Gestão de defeitos](Gestao-de-Defeitos-Riscos-e-Rastreabilidade)

## Integração contínua (GitHub Actions)

O workflow [`.github/workflows/ci.yml`](https://github.com/RoxaneNayara/misteriobox/blob/main/.github/workflows/ci.yml)
roda a cada `push` e `pull request` para `main`, com permissão somente de leitura do repositório
(`contents: read`) e sem segredos: tudo sobe dentro do próprio runner, com MongoDB em memória.

| Etapa                                      | Comando                                                 |
| ------------------------------------------ | ------------------------------------------------------- |
| Instalação reprodutível                    | `npm ci`                                                |
| ESLint                                     | `npm run lint`                                          |
| Prettier                                   | `npm run format:check`                                  |
| Build do backend e do frontend             | `npm run build -w backend`, `npm run build -w frontend` |
| Testes do backend e do frontend            | `npm run test -w backend`, `npm run test -w frontend`   |
| Tipos dos testes E2E e da função da Vercel | `npm run typecheck:e2e`, `npm run typecheck:api`        |
| Ponta a ponta                              | `npm run test:e2e`                                      |
| Suítes de QA (API e interface)             | Mocha e Playwright com `playwright.qa.config.js`        |
| Relatório do Playwright                    | Enviado como artefato quando alguma etapa falha         |

Um pull request só é integrado com o CI aprovado e a revisão da responsável pelo projeto.

## Implantação (Vercel + MongoDB Atlas)

O guia completo, com passo a passo, checklist de variáveis, smoke tests e rollback, está em
[`docs/implantacao.md`](https://github.com/RoxaneNayara/misteriobox/blob/main/docs/implantacao.md).

| Peça                | Como funciona                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Site                | Build do Vite (`frontend/dist`) servido como estático; rotas do SPA reescritas para `index.html`                                       |
| API                 | Função serverless [`api/index.ts`](https://github.com/RoxaneNayara/misteriobox/blob/main/api/index.ts) atende `/api/*` e `/api-docs/*` |
| Preparação do banco | Na primeira requisição de cada instância: conexão, criação só dos índices que faltam e carga idempotente das missões                   |
| Banco               | MongoDB Atlas, um banco por ambiente e um usuário com `readWrite` apenas no próprio banco                                              |

### Separação entre Production e Preview

- Variáveis `MONGODB_URI`, `MONGODB_DB_NAME` e `JWT_SECRET` definidas separadamente para cada
  ambiente da Vercel.
- A API recusa iniciar se Preview apontar para um banco que não seja de prévia, ou se Production
  apontar para um banco de prévia
  ([`config/env.ts`](https://github.com/RoxaneNayara/misteriobox/blob/main/backend/src/config/env.ts)).
- Usuários demonstrativos nunca são criados em ambiente publicado.
- Se as variáveis de Preview não estiverem cadastradas, as implantações de prévia sobem o site,
  mas a API não inicia (falha de configuração) — o que impede, por construção, o uso do banco de
  Production.

### Diagnóstico de falhas

Se o banco estiver indisponível, a API responde `503 SERVICE_UNAVAILABLE` e registra uma linha com
metadados seguros, por exemplo:

```
[api] Banco de dados indisponível: {"phase":"indices","name":"MongoServerError","code":13,"codeName":"Unauthorized","category":"permissao"}
```

A tabela de causas por etapa e código está na seção 5.1 do guia de implantação.

### Atualização do catálogo

A carga do catálogo é idempotente e preserva os identificadores das missões. Mudar suspeitos,
evidências ou a solução de uma missão já publicada pode afetar tentativas em andamento; por isso os
identificadores publicados são congelados por teste (`published-catalog.test.ts`) e as regras de
atualização estão na seção 2.6 do guia.
