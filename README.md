# MistérioBox

Plataforma Web de investigação interativa: o jogador assume o papel de detetive e soluciona
mistérios fictícios analisando evidências, suspeitos, depoimentos e pistas.

---

## 1. O que é a MistérioBox

A MistérioBox é composta por uma **API REST independente** (Node.js + Express + TypeScript) e um
**site Web** (React + TypeScript + Vite) que consome essa API. O jogador cria sua conta, escolhe um
caso no catálogo, investiga e, ao final, faz uma acusação que gera uma pontuação e uma
classificação de detetive.

## 2. Objetivo da aplicação

Oferecer uma experiência de investigação cinematográfica com quatro funcionalidades:

1. **Login e cadastro** — cadastro (nome, e-mail, senha), login, logout e identificação do jogador.
2. **Catálogo de missões** — painel da agência com a credencial do detetive e indicadores reais
   (casos disponíveis, em andamento e solucionados) e o "Arquivo central de casos" com título,
   sinopse, dificuldade, quantidade de evidências, status e botão para iniciar, continuar ou
   **jogar novamente**.
3. **Investigação interativa** — história, suspeitos e depoimentos, análise de evidências,
   desbloqueio de evidências dependentes, dicas, progresso, retomada e abandono.
4. **Resolução e classificação** — acusação (suspeito + evidência), resultado, pontuação,
   classificação e solução completa do caso.

Complementos: **Meu histórico** (todas as tentativas do jogador, com resultado de cada uma) e
**novas tentativas** de missões já encerradas, preservando as anteriores.

Todas as regras de negócio são executadas no backend; o frontend apenas exibe o que a API retorna.

## 3. Tecnologias utilizadas

| Camada         | Tecnologias                                                     |
| -------------- | --------------------------------------------------------------- |
| Frontend       | React 18, TypeScript, Vite 6, React Router 6, CSS responsivo    |
| Backend        | Node.js, Express 5, TypeScript, Zod (validação), JWT, bcryptjs  |
| Banco de dados | MongoDB Memory Server + Mongoose                                |
| Documentação   | OpenAPI 3 (`docs/openapi.yaml`) + Swagger UI                    |
| Qualidade      | ESLint 9 (typescript-eslint, react-hooks, jsx-a11y), Prettier 3 |

## 4. Pré-requisitos

- **Node.js 20 ou superior** (testado com Node 24) e **npm 10+**.
- Conexão com a internet **apenas na primeira execução**: o MongoDB Memory Server baixa
  automaticamente o binário do MongoDB (~70 MB) e o guarda em cache
  (`~/.cache/mongodb-binaries`). Nenhum cadastro ou serviço externo é necessário.

## 5. Como instalar as dependências

Na raiz do projeto (o npm workspaces instala backend e frontend de uma vez):

```bash
npm install
```

Opcionalmente, crie os arquivos de ambiente a partir dos exemplos:

```bash
cp backend/.env.example backend/.env
```

```bash
cp frontend/.env.example frontend/.env
```

Se `backend/.env` não existir, a API usa valores padrão e gera um `JWT_SECRET` temporário a cada
inicialização (os tokens deixam de valer quando a API reinicia).

## 6. Como executar frontend e backend no macOS

Modo desenvolvimento (backend e frontend juntos, com recarga automática):

```bash
npm run dev
```

Ou em dois terminais separados:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

Modo produção local (após `npm run build`):

```bash
npm start
```

| Serviço    | Desenvolvimento                | `npm start` (build)            |
| ---------- | ------------------------------ | ------------------------------ |
| Site Web   | http://localhost:5173          | http://localhost:4173          |
| API REST   | http://localhost:3333/api      | http://localhost:3333/api      |
| Swagger UI | http://localhost:3333/api-docs | http://localhost:3333/api-docs |

O frontend chama `/api`, e o Vite encaminha essas chamadas para `http://localhost:3333`
(proxy configurado em `frontend/vite.config.ts`). Para encerrar, use `Ctrl + C` no terminal.

## 7. Como inicializar os dados demonstrativos

Não há passo manual. Ao iniciar, o backend:

1. sobe uma instância do MongoDB em memória;
2. valida a integridade das missões (referências, ausência de dependências circulares);
3. grava as três missões e os três usuários demonstrativos (senhas com hash bcrypt).

Para voltar ao estado inicial, basta reiniciar o backend.

## 8. Credenciais dos usuários de teste

> Uso **exclusivamente local**. São dados fictícios de demonstração.

| Nome           | E-mail              | Senha       |
| -------------- | ------------------- | ----------- |
| Sofia Almeida  | `sofia@example.com` | `Sofia@123` |
| Bruno Carvalho | `bruno@example.com` | `Bruno@123` |
| Lívia Rocha    | `livia@example.com` | `Livia@123` |

Nenhum usuário começa com investigações; todos partem do mesmo estado.

## 9. As três missões

| ID           | Título              | Dificuldade | Tema                        | Suspeitos | Evidências | Dicas |
| ------------ | ------------------- | ----------- | --------------------------- | --------- | ---------- | ----- |
| `missao-001` | O Último Aplauso    | Fácil       | Roubo em um teatro          | 3         | 5          | 2     |
| `missao-002` | O Quarto 307        | Médio       | Desaparecimento em um hotel | 4         | 8          | 3     |
| `missao-003` | A Carta de Novembro | Difícil     | Segredo de família          | 5         | 12         | 3     |

- **O Último Aplauso** — na noite de estreia, o violino histórico Aurora desaparece de uma sala
  trancada durante um apagão de sete minutos. Diretora, músico e chefe da segurança tinham acesso.
- **O Quarto 307** — um auditor desaparece de madrugada; os pertences ficam no quarto e os
  registros da portaria não batem com os registros automáticos do hotel.
- **A Carta de Novembro** — após a morte de um empresário, uma carta de 1979 sugere que um
  incêndio na tecelagem da família foi atribuído ao funcionário errado. Alguém da casa tenta
  apagar o que restou da verdade.

Cada missão tem uma única solução, uma evidência decisiva e cadeias de desbloqueio entre evidências
(sem ciclos). Todas podem ser resolvidas por dedução e liberam pelo menos três evidências desde o
início. Os dados ficam em `backend/src/database/seed/missions/`. O culpado, a evidência decisiva e
a explicação **nunca** são enviados ao frontend antes da acusação (o campo `solution` não é
selecionado por padrão no Mongoose).

## 10. As oito regras de negócio

| Regra                                     | Descrição                                                                                                                                                                                                                                                                                                  | Onde está implementada                                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **RN01 — Acesso às missões**              | Só usuários autenticados iniciam investigações; cada jogador acessa apenas as próprias (outro jogador recebe `403`).                                                                                                                                                                                       | `middlewares/authenticate.ts`, `investigation.service.ts` (`loadOwnedInvestigation`)                                    |
| **RN02 — Níveis de dificuldade**          | Toda missão tem `FACIL`, `MEDIO` ou `DIFICIL` (enum no modelo) e o nível aparece no catálogo.                                                                                                                                                                                                              | `models/mission.model.ts`                                                                                               |
| **RN03 — Desbloqueio de evidências**      | Evidências com pré-requisitos só podem ser analisadas quando todos foram analisados (`422 EVIDENCE_LOCKED`). Evidências bloqueadas não têm conteúdo enviado.                                                                                                                                               | `services/evidence-rules.ts`, `investigation.service.ts`, `mappers/investigation.mapper.ts`                             |
| **RN04 — Acusação**                       | Exige 3+ evidências analisadas, suspeito válido e evidência já analisada; apenas uma acusação por investigação.                                                                                                                                                                                            | `investigation.service.ts` (`accuse`)                                                                                   |
| **RN05 — Pontuação e classificação**      | Suspeito correto 70; evidência decisiva +30 (só com suspeito correto); −10 por dica; mínimo 0, máximo 100. Classificação: 90–100 Detetive Mestre, 70–89 Investigador Experiente, 40–69 Detetive Aprendiz, 0–39 Investigação Inconclusiva.                                                                  | `services/scoring.service.ts`                                                                                           |
| **RN06 — Salvamento automático**          | Cada ação confirmada grava evidências analisadas, desbloqueadas, dicas e status. Logout não altera a investigação.                                                                                                                                                                                         | `investigation.service.ts`, `investigation.repository.ts`                                                               |
| **RN07 — Abandono**                       | Com confirmação no frontend, a investigação vira `ABANDONADO`, sem pontuação, sem retomada; o progresso continua consultável. Cancelar não altera nada.                                                                                                                                                    | `investigation.service.ts` (`abandon`), `InvestigationPage.tsx`                                                         |
| **RN08 — Finalização e novas tentativas** | Uma investigação encerrada não pode receber novas ações (`409 INVESTIGATION_FINISHED`). Entretanto, o jogador pode iniciar uma nova tentativa da mesma missão, preservando o histórico das tentativas anteriores. A solução do mistério somente pode ser revelada nas tentativas finalizadas por acusação. | `investigation.service.ts` (`ensureInProgress`, `start`), `investigation.model.ts` (índices), `investigation.mapper.ts` |

### Novas tentativas (RN08)

- Cada missão aceita **várias tentativas** por jogador, numeradas em sequência (`attemptNumber`
  1, 2, 3...), mas **no máximo uma `EM_ANDAMENTO`** por jogador e missão.
- Uma nova tentativa começa do zero: nenhuma evidência analisada, nenhuma dica e nenhuma acusação.
  Tentativas encerradas nunca são reabertas, substituídas ou modificadas, e seus relatórios
  continuam acessíveis pelo histórico.
- A regra é garantida no banco por um **índice único parcial** (`userId + missionId` apenas para
  `status: EM_ANDAMENTO`) e por um índice único de numeração (`userId + missionId +
attemptNumber`). Em requisições simultâneas, apenas uma criação vence; as demais recebem
  `409 INVESTIGATION_ALREADY_EXISTS` com `details.investigationId` da tentativa a continuar (ou,
  em corridas raras, `409 CONCURRENT_UPDATE`) — nunca `500`.
- No catálogo, missões com tentativas encerradas e nenhuma ativa exibem **"Jogar novamente"** e o
  link "Ver último relatório".

### Histórico individual

- Tela **Meu histórico** (`/historico`) e endpoint `GET /api/investigations`, que usa apenas o
  jogador do token: não há como consultar o histórico de outro jogador.
- Cada registro mostra missão, dificuldade, número da tentativa, início, encerramento, status,
  evidências analisadas, dicas usadas, pontuação e classificação, da mais recente para a mais
  antiga. Os registros são somente leitura.
- **Pontuação ausente × zero**: tentativas em andamento ou abandonadas têm `score: null` (exibido
  como "Sem pontuação"/"Em andamento"); uma acusação errada tem `score: 0` com a classificação
  "Investigação Inconclusiva".
- Ações: continuar (em andamento), ver relatório (encerrada por acusação) ou ver registro
  (abandonada, sem revelar a solução).
- O indicador **Solucionados** do painel conta **missões distintas** resolvidas: resolver o mesmo
  caso duas vezes conta 1.

## 11. Endpoints principais da API

Base: `http://localhost:3333/api`. Sucesso: `{ "data": ... }`. Erro:
`{ "error": { "code", "message", "details"? } }`. Rotas protegidas usam
`Authorization: Bearer <token>`.

| Método | Rota                                                   | Descrição                                                                        | Auth     |
| ------ | ------------------------------------------------------ | -------------------------------------------------------------------------------- | -------- |
| GET    | `/health`                                              | Verificação de saúde                                                             | —        |
| POST   | `/auth/register`                                       | Cadastro (retorna token)                                                         | —        |
| POST   | `/auth/login`                                          | Login (retorna token)                                                            | —        |
| GET    | `/auth/me`                                             | Jogador autenticado                                                              | ✔        |
| GET    | `/missions`                                            | Catálogo (tentativa ativa ou mais recente e total de tentativas, se autenticado) | opcional |
| GET    | `/missions/{missionId}`                                | Detalhes públicos da missão                                                      | —        |
| GET    | `/investigations`                                      | Histórico do jogador autenticado                                                 | ✔        |
| POST   | `/investigations`                                      | Inicia nova tentativa (`{ "missionId" }`)                                        | ✔        |
| GET    | `/investigations/{id}`                                 | Progresso da investigação                                                        | ✔        |
| POST   | `/investigations/{id}/evidences/{evidenceId}/analysis` | Analisa evidência                                                                | ✔        |
| POST   | `/investigations/{id}/hints`                           | Revela a próxima dica                                                            | ✔        |
| POST   | `/investigations/{id}/abandon`                         | Abandona a investigação                                                          | ✔        |
| POST   | `/investigations/{id}/accusation`                      | Acusação (`{ "suspectId", "evidenceId" }`)                                       | ✔        |
| GET    | `/investigations/{id}/result`                          | Relatório final                                                                  | ✔        |

O logout é feito no cliente (o token é descartado); como o JWT não tem estado, não há rota de
logout. Principais códigos HTTP: `400` dados inválidos, `401` não autenticado, `403` investigação
de outro jogador, `404` recurso inexistente, `409` estado incompatível (investigação finalizada,
já existente, sem dicas), `422` regra de negócio violada (evidência bloqueada, evidências
insuficientes, evidência não analisada). A lista completa de códigos está no Swagger.

## 12. URLs de acesso

- Site Web: **http://localhost:5173**
- API REST: **http://localhost:3333/api**
- Swagger UI: **http://localhost:3333/api-docs**
- Documento OpenAPI em JSON: http://localhost:3333/api-docs/openapi.json
- Arquivo versionado: [`docs/openapi.yaml`](docs/openapi.yaml)

## 13. Estrutura de pastas

```
misteriobox/
├── backend/
│   ├── src/
│   │   ├── config/          # variáveis de ambiente e caminhos
│   │   ├── controllers/     # camada HTTP (sem regra de negócio)
│   │   ├── database/
│   │   │   ├── connection.ts        # MongoDB Memory Server
│   │   │   └── seed/                # usuários, missões e validação de integridade
│   │   ├── errors/          # AppError e códigos de erro
│   │   ├── mappers/         # conversão de documentos em respostas (oculta segredos)
│   │   ├── middlewares/     # autenticação, validação e tratamento de erros
│   │   ├── models/          # schemas Mongoose
│   │   ├── repositories/    # acesso a dados
│   │   ├── routes/          # rotas da API e Swagger
│   │   ├── services/        # regras de negócio (RN01–RN08)
│   │   ├── types/           # extensões de tipos do Express
│   │   ├── utils/           # respostas HTTP padronizadas
│   │   ├── validators/      # schemas Zod de entrada
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # cliente HTTP e chamadas à API
│   │   ├── components/      # layout, guardas de rota, diálogo, badges, feedback
│   │   ├── context/         # sessão do jogador
│   │   ├── pages/           # login, cadastro, catálogo, histórico, investigação, resultado
│   │   ├── styles/          # CSS global responsivo
│   │   ├── types/           # tipos das respostas da API
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── docs/
│   └── openapi.yaml
├── .gitignore
├── .prettierrc.json
├── package.json             # scripts e workspaces
└── README.md
```

## 14. Limitações do banco de dados em memória

- Os dados existem **somente enquanto o backend estiver em execução**. Ao reiniciar a API (inclusive
  quando o modo `dev` recarrega após uma alteração de código), cadastros e progresso são perdidos e
  os dados demonstrativos são recriados.
- O salvamento automático e o **histórico de tentativas** sobrevivem a logout, fechamento do
  navegador e novo login, **mas não são persistência permanente**: ao reiniciar o backend, o
  histórico de todos os jogadores é apagado.
- Após reiniciar a API, um token salvo no navegador deixa de ser válido e o site pede novo login.
- A primeira execução precisa de internet para baixar o binário do MongoDB.

## 15. Como gerar o build

```bash
npm run build
```

Gera `backend/dist` (JavaScript compilado) e `frontend/dist` (site estático). Para executar o
build: `npm start`.

## Scripts disponíveis (raiz)

| Script                                         | Ação                                          |
| ---------------------------------------------- | --------------------------------------------- |
| `npm install` (ou `npm run setup`)             | Instala as dependências de backend e frontend |
| `npm run dev`                                  | Backend + frontend em modo desenvolvimento    |
| `npm run dev:backend` / `npm run dev:frontend` | Cada parte separadamente                      |
| `npm run build`                                | Build de produção dos dois projetos           |
| `npm start`                                    | Executa o build (API + `vite preview`)        |
| `npm run lint` / `npm run lint:fix`            | ESLint em backend e frontend                  |
| `npm run format` / `npm run format:check`      | Prettier                                      |

## Preparação para testes (QA)

Esta etapa não inclui testes. Para facilitar a automação futura:

- regras de negócio isoladas em funções puras (`scoring.service.ts`, `evidence-rules.ts`) e em
  services sem dependência da interface;
- dados demonstrativos previsíveis e recriados a cada inicialização;
- códigos de erro estáveis (`error.code`) em todas as respostas de falha;
- atributos `data-testid` nos elementos relevantes (ex.: `login-email`, `mission-card-missao-001`,
  `mission-action-missao-001`, `evidence-analyze-ev-01`, `hint-request`, `accusation-submit`,
  `abandon-dialog-confirm`, `result-score`, `result-classification`, `nav-history`,
  `detective-panel`, `stat-available`, `stat-in-progress`, `stat-solved`,
  `mission-last-report-missao-001`, `history-list`, `history-item-<id>`, `history-score-<id>`,
  `history-action-<id>`, `history-empty`).
