# Testes automatizados e ferramentas

[← Início](Home) · Anterior: [Estratégia de testes](Estrategia-de-Testes-e-Quality-Engineering) ·
Próxima: [Integração contínua](Integracao-Continua-e-Implantacao)

## Mapa das suítes

| Suíte                       | Pasta no repositório                | Ferramentas                             | Comando                    |
| --------------------------- | ----------------------------------- | --------------------------------------- | -------------------------- |
| Backend — unitários         | `backend/tests/unit/`               | Vitest 4                                | `npm run test -w backend`  |
| Backend — integração        | `backend/tests/integration/`        | Vitest 4, Supertest, MongoDB em memória | `npm run test -w backend`  |
| Frontend — unitários        | `frontend/src/utils/` (`*.test.ts`) | Vitest 4                                | `npm run test -w frontend` |
| Ponta a ponta (E2E)         | `e2e/`                              | Playwright + TypeScript (Chromium)      | `npm run test:e2e`         |
| QA — API por história       | `tests/gestaodeusuarios/api/`       | Mocha, Chai, Supertest                  | ver abaixo                 |
| QA — interface por história | `tests/gestaodeusuarios/ui/`        | Playwright (JavaScript)                 | ver abaixo                 |

## Backend

### Unitários (`backend/tests/unit/`)

| Arquivo                              | Foco                                                                              |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| `auth.validator.test.ts`             | Política de nome, e-mail e senha; valores-limite; regressões B01 e B03            |
| `validation-messages.test.ts`        | Contrato das mensagens de validação: campo ausente, tipo inválido, campos extras  |
| `password.service.test.ts`           | Limite de 72 bytes do bcrypt, sem truncamento silencioso                          |
| `mission-catalog.test.ts`            | Integridade das 10 missões: distribuição, referências, cadeias, dificuldade       |
| `published-catalog.test.ts`          | Identificadores do catálogo publicado não mudam (protege tentativas em andamento) |
| `solution-reveal.test.ts`            | Limite de 50 pontos e pontuações alcançáveis                                      |
| `env.test.ts`                        | Configuração por ambiente e isolamento Preview × Production                       |
| `database-error-diagnostics.test.ts` | Log seguro de falhas do banco (sem URI, usuário ou senha)                         |
| `log-safety.test.ts`                 | Senhas demonstrativas nunca exibidas; erros inesperados sem dados em produção     |
| `persistence-documentation.test.ts`  | A documentação diferencia o Atlas persistente do banco em memória local           |

### Integração (`backend/tests/integration/`)

| Arquivo                                  | Foco                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| `auth-and-input-security.test.ts`        | Cadastro, login, normalização e prevenção de injeção de operadores do MongoDB  |
| `session-and-content-type.test.ts`       | Inatividade, renovação, limite de 8 h (B04) e `415` (B06)                      |
| `investigation-access-and-rules.test.ts` | 403 entre jogadores, recusas da acusação, 409 após encerramento e concorrência |
| `mission-catalog-flow.test.ts`           | Catálogo pela API, desbloqueio, acusação e nova tentativa                      |
| `solution-reveal.test.ts`                | Revelação da solução por faixa de pontuação, histórico e abandono              |
| `persistence.test.ts`                    | Dados e índices preservados com banco persistente                              |
| `vercel-handler.test.ts`                 | Função serverless: rotas, Swagger e catálogo                                   |
| `vercel-handler-unavailable.test.ts`     | Resposta `503` com log seguro quando o banco está indisponível                 |
| `database-setup-failures.test.ts`        | Falhas reais de autenticação e permissão com MongoDB protegido por senha       |

Exemplo de verificação de concorrência (trecho de `investigation-access-and-rules.test.ts`): oito
requisições simultâneas para iniciar a mesma missão devem criar uma única tentativa.

```ts
const statuses = responses.map((response) => response.status);
expect(statuses.filter((status) => status === 201)).toHaveLength(1);
expect(statuses.every((status) => status === 201 || status === 409)).toBe(true);
```

## Frontend (`frontend/src/utils/`)

| Arquivo              | Foco                                                                |
| -------------------- | ------------------------------------------------------------------- |
| `validation.test.ts` | As mesmas regras de cadastro do backend, para avisar antes do envio |
| `session.test.ts`    | Regras de expiração da sessão no navegador                          |
| `redirect.test.ts`   | Destino após o login aceita só caminhos internos do site            |

## Ponta a ponta (Playwright)

Rodam em Chromium contra o build da API (porta 3400) e o `vite preview` (porta 4173), sem conflitar
com `npm run dev`.

| Arquivo                          | Foco                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `session.spec.ts`                | Expiração por inatividade com relógio simulado, logout em várias abas, retomada    |
| `navigation-redirect.spec.ts`    | Retorno à página protegida após o login, sempre no próprio site                    |
| `history-persistence.spec.ts`    | Texto do histórico e tentativa preservada após logout e novo login                 |
| `catalog-sectors.spec.ts`        | Setores do catálogo, "Em breve", largura da tela, início de missão                 |
| `catalog-layout.spec.ts`         | Cards da credencial alinhados; descrição do Arquivo central de 320 a 1920 px       |
| `header-back-to-top.spec.ts`     | Cabeçalho responsivo e botão "Voltar ao topo" (mouse, teclado, movimento reduzido) |
| `navigation-responsive.spec.ts`  | Menu da investigação em uma linha, navegação por teclado, varredura com nome longo |
| `investigation-nav.spec.ts`      | Menu da investigação acessível em várias larguras (B05)                            |
| `investigation-feedback.spec.ts` | Notificações de 4 s: posição, substituição, região viva, teclado                   |
| `abandon-confirmation.spec.ts`   | Cancelar o abandono (botão ou Esc) não envia nada; confirmar encerra a tentativa   |
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

`scripts/smoke-test.mjs` verifica uma URL publicada. Por padrão só lê; com `--write` cria um
jogador de teste aleatório. Nenhuma senha ou token é exibido.

```bash
npm run smoke -- https://misteriobox.vercel.app
```

> Use `--write` apenas quando for aceitável criar uma conta de teste no banco do ambiente
> verificado.
