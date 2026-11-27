# Testes automatizados e ferramentas

[← Início](Home) · Anterior: [Estratégia de testes](Estrategia-de-Testes-e-Quality-Engineering) ·
Próxima: [Integração contínua](Integracao-Continua-e-Implantacao)

## Mapa das suítes

| Suíte                       | Pasta                                                                                                            | Ferramentas                           | Comando                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------- |
| Backend — unitários         | [`backend/tests/unit`](https://github.com/RoxaneNayara/misteriobox/tree/main/backend/tests/unit)                 | Vitest                                | `npm run test -w backend`  |
| Backend — integração        | [`backend/tests/integration`](https://github.com/RoxaneNayara/misteriobox/tree/main/backend/tests/integration)   | Vitest, Supertest, MongoDB em memória | `npm run test -w backend`  |
| Frontend — unitários        | [`frontend/src/utils`](https://github.com/RoxaneNayara/misteriobox/tree/main/frontend/src/utils) (`*.test.ts`)   | Vitest                                | `npm run test -w frontend` |
| Ponta a ponta               | [`e2e/`](https://github.com/RoxaneNayara/misteriobox/tree/main/e2e)                                              | Playwright + TypeScript               | `npm run test:e2e`         |
| QA — API por história       | [`tests/gestaodeusuarios/api`](https://github.com/RoxaneNayara/misteriobox/tree/main/tests/gestaodeusuarios/api) | Mocha, Chai, Supertest                | ver abaixo                 |
| QA — interface por história | [`tests/gestaodeusuarios/ui`](https://github.com/RoxaneNayara/misteriobox/tree/main/tests/gestaodeusuarios/ui)   | Playwright (JavaScript)               | ver abaixo                 |

## Backend

| Arquivo                                        | Foco                                                                              |
| ---------------------------------------------- | --------------------------------------------------------------------------------- |
| `unit/auth.validator.test.ts`                  | Política de nome, e-mail e senha; valores-limite; regressões B01 e B03            |
| `unit/password.service.test.ts`                | Limite de 72 bytes do bcrypt, sem truncamento silencioso                          |
| `unit/mission-catalog.test.ts`                 | Integridade das 10 missões: distribuição, referências, cadeias, dificuldade       |
| `unit/published-catalog.test.ts`               | Identificadores do catálogo publicado não mudam (protege tentativas em andamento) |
| `unit/solution-reveal.test.ts`                 | Limite de 50 pontos e pontuações alcançáveis                                      |
| `unit/env.test.ts`                             | Configuração por ambiente e isolamento Preview × Production                       |
| `unit/database-error-diagnostics.test.ts`      | Log seguro de falhas do banco (sem URI, usuário ou senha)                         |
| `integration/auth-and-input-security.test.ts`  | Cadastro, login, normalização e prevenção de injeção de operadores                |
| `integration/session-and-content-type.test.ts` | Inatividade, renovação, limite de 8 h (B04) e `415` (B06)                         |
| `integration/mission-catalog-flow.test.ts`     | Catálogo pela API, desbloqueio, acusação e nova tentativa                         |
| `integration/solution-reveal.test.ts`          | Revelação da solução por faixa de pontuação, histórico e abandono                 |
| `integration/persistence.test.ts`              | Dados e índices preservados com banco persistente                                 |
| `integration/vercel-handler*.test.ts`          | Função serverless: rotas, Swagger e resposta `503` com log seguro                 |
| `integration/database-setup-failures.test.ts`  | Falhas reais de autenticação e permissão com MongoDB protegido por senha          |

## Ponta a ponta (Playwright)

Rodam em Chromium contra o build da API (porta 3400) e o `vite preview` (porta 4173), sem conflitar
com `npm run dev`.

| Arquivo                          | Foco                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `session.spec.ts`                | Expiração por inatividade com relógio simulado, logout em várias abas, retomada    |
| `catalog-sectors.spec.ts`        | Setores do catálogo, "Em breve", largura da tela, início de missão                 |
| `header-back-to-top.spec.ts`     | Cabeçalho responsivo e botão "Voltar ao topo" (mouse, teclado, movimento reduzido) |
| `navigation-responsive.spec.ts`  | Menu da investigação em uma linha, navegação por teclado, varredura com nome longo |
| `investigation-nav.spec.ts`      | Menu da investigação acessível em várias larguras (B05)                            |
| `investigation-feedback.spec.ts` | Notificações de 4 s: posição, substituição, região viva, teclado                   |
| `solution-reveal.spec.ts`        | Relatório lacrado com 0 ponto e revelado com 50 e 100 pontos                       |

Exemplo de espera por condição (trecho de `investigation-feedback.spec.ts`): o teste mede a
posição da notificação só depois que a animação de entrada termina, em vez de esperar um tempo fixo.

```ts
// Mede a posição final: espera a animação de entrada terminar (sem tempo fixo).
await toast(page).evaluate((element) =>
  Promise.all(element.getAnimations().map((animation) => animation.finished)),
);
```

## Suítes de QA por história de usuário

Organizadas por história (US) e caso de teste (CT), em JavaScript, separadas dos testes do código:

| Caso      | API                               | Interface                                 |
| --------- | --------------------------------- | ----------------------------------------- |
| US01-CT01 | Cadastro com dados válidos        | Cadastro válido pela interface            |
| US01-CT04 | Nome, e-mail e senha inválidos    | Nome, e-mail e senha inválidos            |
| US02-CT01 | Login com credenciais válidas     | Login pela interface                      |
| US03-CT02 | Sem autenticação e token inválido | Sem autenticação e novo login após logout |

Executam contra a API na porta 3333 e o site na porta 5173 (`playwright.qa.config.js`):

```bash
npx mocha "tests/gestaodeusuarios/api/*.test.mjs"
```

```bash
npx playwright test --config=playwright.qa.config.js
```

## Smoke test pós-implantação

[`scripts/smoke-test.mjs`](https://github.com/RoxaneNayara/misteriobox/blob/main/scripts/smoke-test.mjs)
verifica uma URL publicada. Por padrão só lê; com `--write` cria um jogador de teste aleatório.
Nenhuma senha ou token é exibido.

```bash
npm run smoke -- https://<seu-projeto>.vercel.app
```
