# MistérioBox

[![CI](https://github.com/RoxaneNayara/misteriobox/actions/workflows/ci.yml/badge.svg)](https://github.com/RoxaneNayara/misteriobox/actions/workflows/ci.yml)

Plataforma Web de investigação interativa: o jogador assume o papel de detetive e soluciona
mistérios fictícios analisando evidências, suspeitos, depoimentos e pistas.

> Projeto **acadêmico e experimental**. Veja a seção
> [15. Caráter acadêmico e experimental](#15-caráter-acadêmico-e-experimental).

---

## Sumário

1. [Nome e descrição](#1-nome-e-descrição)
2. [Objetivo da plataforma](#2-objetivo-da-plataforma)
3. [Principais funcionalidades](#3-principais-funcionalidades)
4. [Tecnologias utilizadas](#4-tecnologias-utilizadas)
5. [Arquitetura geral](#5-arquitetura-geral)
6. [Como instalar e executar localmente](#6-como-instalar-e-executar-localmente)
7. [Acesso ao frontend, à API e ao Swagger](#7-acesso-ao-frontend-à-api-e-ao-swagger)
8. [Dados de demonstração](#8-dados-de-demonstração)
9. [Regras de negócio (RN01 a RN08)](#9-regras-de-negócio-rn01-a-rn08)
10. [Histórico e reinício de missões](#10-histórico-e-reinício-de-missões)
11. [Estrutura do projeto](#11-estrutura-do-projeto)
12. [Lint, Prettier, build e testes](#12-lint-prettier-build-e-testes)
13. [Pipeline de integração contínua (CI)](#13-pipeline-de-integração-contínua-ci)
14. [Limitações conhecidas](#14-limitações-conhecidas)
15. [Caráter acadêmico e experimental](#15-caráter-acadêmico-e-experimental)

---

## 1. Nome e descrição

**MistérioBox** é composta por uma **API REST independente** (Node.js + Express + TypeScript) e um
**site Web** (React + TypeScript + Vite) que consome essa API. O jogador cria sua conta, escolhe um
caso no catálogo, investiga e, ao final, faz uma acusação que gera uma pontuação e uma
classificação de detetive. A interface tem identidade cinematográfica inspirada em arquivos
confidenciais, dossiês e histórias de suspense.

## 2. Objetivo da plataforma

Oferecer uma experiência de investigação interativa e cinematográfica, com missões de diferentes
níveis de dificuldade, em que o jogador deduz o responsável por cada mistério a partir de
evidências e depoimentos e é classificado conforme seu desempenho. Todas as regras de negócio são
executadas no backend; o frontend apenas exibe o que a API retorna.

## 3. Principais funcionalidades

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

### Catálogo: 10 missões em três setores

O catálogo gratuito tem **10 missões** — 3 fáceis, 3 médias e 4 difíceis —, exibidas na tela de
casos em três setores da agência:

| Setor                                        | ID           | Título                  | Tema                               | Suspeitos | Evidências | Dicas |
| -------------------------------------------- | ------------ | ----------------------- | ---------------------------------- | --------- | ---------- | ----- |
| Investigações iniciais (Fácil)               | `missao-001` | O Último Aplauso        | Roubo em um teatro                 | 3         | 5          | 2     |
|                                              | `missao-004` | A Assinatura Falsa      | Fraude documental em leilão        | 3         | 5          | 2     |
|                                              | `missao-005` | O Troféu Trocado        | Sabotagem em premiação             | 4         | 6          | 2     |
| Investigações especiais (Médio)              | `missao-002` | O Quarto 307            | Desaparecimento em um hotel        | 4         | 8          | 3     |
|                                              | `missao-006` | O Segredo da Galeria    | Substituição de obra de arte       | 4         | 8          | 3     |
|                                              | `missao-007` | O Voto Decisivo         | Fraude em assembleia empresarial   | 5         | 9          | 2     |
| Investigações de alta complexidade (Difícil) | `missao-003` | A Carta de Novembro     | Segredo de família                 | 5         | 12         | 3     |
|                                              | `missao-008` | Protocolo Zero          | Manipulação de evidências digitais | 5         | 13         | 3     |
|                                              | `missao-009` | O Testamento Impossível | Fraude sucessória e falsificação   | 6         | 12         | 4     |
|                                              | `missao-010` | O Arquivo 17            | Adulteração de testemunhos         | 6         | 15         | 3     |

As três missões originais (`missao-001` a `missao-003`) mantêm ids, textos e solução; o progresso e
o histórico já gravados continuam válidos.

- **O Último Aplauso** — na noite de estreia, o violino histórico Aurora desaparece de uma sala
  trancada durante um apagão de sete minutos. Diretora, músico e chefe da segurança tinham acesso.
- **A Assinatura Falsa** — um relógio de bolso é arrematado por um valor recorde graças a um
  certificado assinado por um perito renomado. O certificado é falso.
- **O Troféu Trocado** — na final de um concurso de gastronomia, o troféu sai com o nome errado.
  Alguém trocou o resultado entre a apuração e a cerimônia.
- **O Quarto 307** — um auditor desaparece de madrugada; os pertences ficam no quarto e os
  registros da portaria não batem com os registros automáticos do hotel.
- **O Segredo da Galeria** — uma pintura volta do restauro e, semanas depois, descobre-se que a tela e
  a moldura são cópias. É preciso reconstruir o trajeto da obra.
- **O Voto Decisivo** — uma fusão é aprovada pelo voto de uma acionista internada que havia
  prometido votar contra.
- **A Carta de Novembro** — após a morte de um empresário, uma carta de 1979 sugere que um
  incêndio na tecelagem da família foi atribuído ao funcionário errado. Alguém da casa tenta
  apagar o que restou da verdade.
- **Protocolo Zero** — dados sigilosos vazam e os registros do sistema apontam um pesquisador
  júnior; mas os registros não batem com o mundo físico.
- **O Testamento Impossível** — um testamento com assinaturas verdadeiras surge numa data em que
  a testadora não conseguia escrever.
- **O Arquivo 17** — fitas encontradas numa caixa de arquivo contradizem as transcrições que
  levaram à condenação de um motorista, dez anos antes.

Abaixo dos setores, a seção **Divisões especializadas — Em breve** apresenta futuras áreas da
agência (Arquivo Morto, Crimes Cibernéticos e Homicídios). É apenas informativa: não há páginas,
cobrança, assinatura nem controle de acesso para essas divisões.

Cada missão tem uma única solução, uma evidência decisiva e cadeias de desbloqueio entre evidências
(sem ciclos). Todas podem ser resolvidas por dedução e liberam pelo menos três evidências desde o
início. A dificuldade não depende só da quantidade de evidências: a validação de integridade
(`backend/src/database/seed/mission-integrity.ts`) exige, por dificuldade, um número mínimo de
suspeitos e dicas, a profundidade da cadeia até a evidência decisiva e, nas missões difíceis, que a
evidência decisiva cruze pelo menos dois pré-requisitos e dependa de pelo menos duas evidências
iniciais distintas (linhas de investigação independentes).

Os dados ficam em `backend/src/database/seed/missions/`. O culpado, a evidência decisiva e
a explicação **nunca** são enviados ao frontend antes da acusação (o campo `solution` não é
selecionado por padrão no Mongoose).

### Validação do cadastro

Todas as regras são aplicadas no backend (`backend/src/validators/auth.validator.ts`); o
frontend repete as mesmas regras (`frontend/src/utils/validation.ts`) apenas para avisar antes do
envio.

| Campo  | Regra                                                                                                                                                                                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nome   | 2 a 80 caracteres após remover espaços externos. Aceita letras Unicode (com acentos), espaços internos, hífens e apóstrofos (`'` ou `’`); começa e termina com letra. Recusa números, símbolos (`*`, `?`, `/`, vírgula…), emojis e caracteres de controle ou invisíveis. |
| E-mail | Até 120 caracteres, formato de e-mail válido; espaços externos removidos e letras convertidas para minúsculas. Apóstrofos são aceitos, inclusive consecutivos (`mariansa''llaw@example.com`).                                                                            |
| Senha  | 8 a 72 caracteres **e** no máximo 72 bytes (UTF-8), com letras e números. Nunca é alterada (sem remoção de espaços). O limite em bytes evita o truncamento silencioso do bcrypt; no login, senhas acima de 72 bytes são recusadas.                                       |

Entradas estruturadas (objetos ou operadores como `{"$gt": ""}`) e campos extras são recusados com
`400 VALIDATION_ERROR`, o que impede injeção de operadores do MongoDB. Os dados do usuário são
exibidos pelo React como texto (sem `innerHTML`).

## 4. Tecnologias utilizadas

| Camada         | Tecnologias                                                     |
| -------------- | --------------------------------------------------------------- |
| Frontend       | React 18, TypeScript, Vite 6, React Router 6, CSS responsivo    |
| Backend        | Node.js, Express 5, TypeScript, Zod (validação), JWT, bcryptjs  |
| Banco de dados | MongoDB Memory Server + Mongoose                                |
| Documentação   | OpenAPI 3 (`docs/openapi.yaml`) + Swagger UI                    |
| Qualidade      | ESLint 9 (typescript-eslint, react-hooks, jsx-a11y), Prettier 3 |
| CI             | GitHub Actions                                                  |

## 5. Arquitetura geral

```
┌──────────────────────────┐   HTTP /api (proxy do Vite)   ┌──────────────────────────────┐
│  Frontend (React + Vite) │ ────────────────────────────► │  API REST (Express + TS)     │
│  porta 5173              │ ◄──────────────────────────── │  porta 3333 · Swagger        │
└──────────────────────────┘        JSON { data }          └──────────────┬───────────────┘
                                                                          │ Mongoose
                                                           ┌──────────────▼───────────────┐
                                                           │ MongoDB Memory Server        │
                                                           │ (iniciado pela própria API)  │
                                                           └──────────────────────────────┘
```

- **Monorepo com npm workspaces**: `backend/` e `frontend/` são projetos independentes, com scripts
  orquestrados pelo `package.json` da raiz.
- **Backend em camadas**: `routes` → `controllers` (HTTP) → `services` (regras de negócio) →
  `repositories` (acesso a dados) → `models` (Mongoose). `validators` (Zod) e `middlewares`
  (autenticação, validação, erros) tratam as entradas; `mappers` montam as respostas e ocultam
  dados secretos.
- **Autenticação** por JWT (`Authorization: Bearer <token>`); senhas armazenadas com bcrypt.
- **Respostas padronizadas**: sucesso `{ "data": ... }`; erro
  `{ "error": { "code", "message", "details"? } }`, com tratamento centralizado.
- **Frontend** consome somente a API real (sem dados simulados), com rotas protegidas, contexto de
  sessão e componentes reutilizáveis.

### Endpoints principais

Base: `http://localhost:3333/api`. Rotas protegidas usam `Authorization: Bearer <token>`.

| Método | Rota                                                   | Descrição                                                                        | Auth     |
| ------ | ------------------------------------------------------ | -------------------------------------------------------------------------------- | -------- |
| GET    | `/health`                                              | Verificação de saúde                                                             | —        |
| POST   | `/auth/register`                                       | Cadastro (retorna token)                                                         | —        |
| POST   | `/auth/login`                                          | Login (retorna token)                                                            | —        |
| GET    | `/auth/me`                                             | Jogador autenticado                                                              | ✔        |
| POST   | `/auth/refresh`                                        | Renova a janela de inatividade da sessão                                         | ✔        |
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

Principais códigos HTTP: `400` dados inválidos, `401` não autenticado ou sessão expirada
(`SESSION_EXPIRED`), `403` investigação de outro jogador, `404` recurso inexistente, `409` estado
incompatível (investigação finalizada, já existente, sem dicas), `415` corpo que não é
`application/json`, `422` regra de negócio violada (evidência bloqueada, evidências insuficientes,
evidência não analisada). A lista completa de códigos está no Swagger. As respostas da API usam
`Cache-Control: no-store`.

### Sessão, inatividade e logout

| Item                       | Comportamento                                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Inatividade                | Sem atividade por **30 minutos** (`SESSION_IDLE_TIMEOUT_SECONDS`), a sessão expira e o site exige novo login antes de mostrar dados protegidos.                                                                                      |
| Limite absoluto            | **8 horas** desde o login (`JWT_EXPIRES_IN_SECONDS`), mesmo com atividade contínua.                                                                                                                                                  |
| Renovação                  | Cada token vale até 30 min. Enquanto há atividade real (clique, tecla, rolagem, toque), o site chama `POST /api/auth/refresh` no máximo a cada 5 min; o novo token mantém o momento do login, então o limite de 8 h não é estendido. |
| Retorno à aba/aplicação    | A sessão é verificada ao abrir o site, ao voltar para a aba, ao receber foco, ao restaurar a página pelo histórico e a cada 15 s. Expirada, o site limpa a sessão local sem buscar dados protegidos.                                 |
| Logout                     | Remove a sessão do navegador (inclusive nas outras abas). Não há revogação no servidor: um token copiado antes do logout continua aceito até expirar — no máximo 30 min sem renovação (antes, até 8 h).                              |
| Investigações              | Fechar a página, expirar a sessão ou sair **não** abandona a investigação (RN06): após novo login, o jogador volta à página em que estava, com o progresso preservado.                                                               |
| Armazenamento no navegador | `localStorage`: token, expiração local do token, último momento de atividade e tempo de inatividade. Tudo é apagado no logout ou na expiração.                                                                                       |

## 6. Como instalar e executar localmente

### Pré-requisitos

- **Node.js 20 ou superior** (testado com Node 24) e **npm 10+**.
- Conexão com a internet **apenas na primeira execução**: o MongoDB Memory Server baixa
  automaticamente o binário do MongoDB (~70 MB) e o guarda em cache
  (`~/.cache/mongodb-binaries`). Nenhum cadastro ou serviço externo é necessário.

### Instalação

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

Se `backend/.env` não existir (ou `JWT_SECRET` estiver vazio), a API usa valores padrão e gera um
`JWT_SECRET` temporário a cada inicialização (os tokens deixam de valer quando a API reinicia). As
senhas dos usuários demonstrativos também vêm do `backend/.env` (veja a seção
[8. Dados de demonstração](#8-dados-de-demonstração)).

### Execução (macOS, Linux ou Windows)

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

O frontend chama `/api`, e o Vite encaminha essas chamadas para `http://localhost:3333`
(proxy configurado em `frontend/vite.config.ts`). Para encerrar, use `Ctrl + C` no terminal.

## 7. Acesso ao frontend, à API e ao Swagger

| Serviço    | Desenvolvimento                | `npm start` (build)            |
| ---------- | ------------------------------ | ------------------------------ |
| Site Web   | http://localhost:5173          | http://localhost:4173          |
| API REST   | http://localhost:3333/api      | http://localhost:3333/api      |
| Swagger UI | http://localhost:3333/api-docs | http://localhost:3333/api-docs |

- Documento OpenAPI em JSON: http://localhost:3333/api-docs/openapi.json
- Arquivo versionado: [`docs/openapi.yaml`](docs/openapi.yaml)

## 8. Dados de demonstração

Não há passo manual. Ao iniciar, o backend:

1. sobe uma instância do MongoDB em memória;
2. valida a integridade do catálogo (10 missões na distribuição 3/3/4, ids únicos, referências,
   ausência de dependências circulares, evidência decisiva alcançável e estrutura por dificuldade);
3. grava as dez missões e os três usuários demonstrativos (senhas com hash bcrypt).

Para voltar ao estado inicial, basta reiniciar o backend.

> Usuários de uso **exclusivamente local**. São dados fictícios de demonstração, com e-mails do
> domínio reservado `example.com`. **Nenhuma senha fica no código ou neste README.**

| Nome           | E-mail              | Variável da senha (em `backend/.env`) |
| -------------- | ------------------- | ------------------------------------- |
| Sofia Almeida  | `sofia@example.com` | `DEMO_USER_SOFIA_PASSWORD`            |
| Bruno Carvalho | `bruno@example.com` | `DEMO_USER_BRUNO_PASSWORD`            |
| Lívia Rocha    | `livia@example.com` | `DEMO_USER_LIVIA_PASSWORD`            |

Como definir as senhas demonstrativas (configuração reproduzível):

1. Copie o exemplo, se ainda não tiver o arquivo:

   ```bash
   cp backend/.env.example backend/.env
   ```

2. Em `backend/.env`, preencha as três variáveis com senhas de sua escolha (mínimo de 8
   caracteres, com letras e números — a mesma política do cadastro). O arquivo `.env` não é
   versionado.
3. Inicie o backend e entre com o e-mail do usuário e a senha que você definiu.

Se as variáveis ficarem vazias, o backend gera **senhas temporárias** a cada inicialização e as
mostra no console do backend (linhas `[seed] ... Senha temporária de ...`). Uma senha definida
fora da política interrompe a inicialização com uma mensagem indicando a variável. Também é
possível criar uma conta própria pela tela de cadastro.

Nenhum usuário começa com investigações; todos partem do mesmo estado.

## 9. Regras de negócio (RN01 a RN08)

A aplicação possui exatamente oito regras de negócio, todas validadas no backend.

### RN01 — Acesso autenticado e isolamento das investigações

Somente usuários autenticados podem iniciar investigações. Cada jogador pode acessar apenas suas
próprias investigações e seus respectivos progressos. Tentativas de acesso não autorizado são
bloqueadas pelo backend (`401` sem autenticação; `403` para investigação de outro jogador). O
histórico usa apenas o jogador identificado pelo token.
_Implementação:_ `middlewares/authenticate.ts`, `investigation.service.ts` (`loadOwnedInvestigation`).

### RN02 — Classificação das missões por dificuldade

Cada missão possui obrigatoriamente um dos níveis **Fácil**, **Médio** ou **Difícil**
(`FACIL`, `MEDIO`, `DIFICIL`), definidos nos dados das missões e apresentados no catálogo.
_Implementação:_ `models/mission.model.ts` (enum obrigatório).

### RN03 — Desbloqueio de evidências mediante pré-requisitos

Determinadas evidências dependem da análise prévia de outras. Uma evidência bloqueada só pode ser
analisada quando **todos** os seus pré-requisitos estiverem cumpridos; a validação ocorre no
backend (`422 EVIDENCE_LOCKED`). O jogador vê quais evidências estão disponíveis e quais
permanecem bloqueadas, sem que o conteúdo das bloqueadas seja enviado ao frontend.
_Implementação:_ `services/evidence-rules.ts`, `investigation.service.ts`, `mappers/investigation.mapper.ts`.

### RN04 — Acusação definitiva após análise de pelo menos três evidências

O jogador deve analisar pelo menos **três evidências** antes de acusar. Cada investigação permite
**apenas uma acusação**, que deve conter o identificador do suspeito escolhido e o identificador da
evidência que sustenta a acusação. A evidência escolhida precisa ter sido analisada pelo jogador.
Acusações que não atendem a essas condições são recusadas (`422 INSUFFICIENT_EVIDENCES`,
`INVALID_SUSPECT`, `EVIDENCE_NOT_ANALYZED`).
_Implementação:_ `investigation.service.ts` (`accuse`).

### RN05 — Pontuação e classificação do detetive

A pontuação é calculada **exclusivamente no backend**:

| Critério                                             | Pontos  |
| ---------------------------------------------------- | ------- |
| Suspeito correto                                     | +70     |
| Evidência decisiva correta (só com suspeito correto) | +30     |
| Cada dica utilizada                                  | −10     |
| Pontuação mínima / máxima                            | 0 / 100 |

Fórmula:

```
base      = (suspeito correto ? 70 : 0) + (suspeito correto E evidência decisiva ? 30 : 0)
pontuação = mín(100, máx(0, base − 10 × dicas utilizadas))
```

| Faixa    | Classificação             |
| -------- | ------------------------- |
| 90 a 100 | Detetive Mestre           |
| 70 a 89  | Investigador Experiente   |
| 40 a 69  | Detetive Aprendiz         |
| 0 a 39   | Investigação Inconclusiva |

A pontuação e a classificação são apresentadas no relatório final. Valores enviados pelo frontend
(como `score`) são rejeitados.
_Implementação:_ `services/scoring.service.ts`.

### RN06 — Salvamento automático e retomada do progresso

O progresso é salvo automaticamente no banco após cada ação confirmada pela API: missão iniciada,
evidências analisadas, evidências desbloqueadas, dicas utilizadas e status da investigação. Após
logout, fechamento do navegador ou novo login, o jogador retoma a missão enquanto os dados
permanecerem no banco em memória. **Logout não é abandono.**
_Implementação:_ `investigation.service.ts`, `investigation.repository.ts`.

### RN07 — Abandono voluntário da investigação

O jogador pode abandonar uma investigação em andamento após uma **confirmação** no frontend. Ao
confirmar, a investigação recebe o status `ABANDONADO`, não recebe pontuação, não pode ser retomada
e o progresso permanece registrado para consulta. Cancelar a confirmação não altera a investigação.
_Implementação:_ `investigation.service.ts` (`abandon`), `InvestigationPage.tsx`.

### RN08 — Finalização, preservação do histórico e novas tentativas

Uma investigação termina como `SOLUCIONADO` (suspeito correto), `NAO_SOLUCIONADO` (suspeito
incorreto) ou `ABANDONADO` (abandono voluntário). **Uma investigação encerrada não pode receber
novas ações** (análises, dicas ou acusações — `409 INVESTIGATION_FINISHED`). Entretanto, o jogador
pode iniciar uma **nova tentativa** da mesma missão, preservando o histórico das tentativas
anteriores. A solução do mistério somente pode ser revelada nas tentativas finalizadas por
acusação **que alcançaram 50 pontos ou mais**. Abaixo de 50 pontos, o relatório mostra a pontuação,
a classificação e a acusação do jogador, mas o culpado, a evidência decisiva e a explicação
continuam em sigilo — e a API não os envia (`solution: null`, `solutionRevealed: false`). A regra
vale também para relatórios de tentativas anteriores, porque é aplicada a cada consulta.

Pontuações possíveis (RN05): múltiplos de 10 entre 0 e 100. A maior abaixo do limite é **40**
(suspeito correto, evidência não decisiva e 3 dicas); **50** é alcançada com suspeito correto,
evidência não decisiva e 2 dicas. Acusar o suspeito errado resulta sempre em 0. Observação: 30 e
40 pontos só ocorrem com o suspeito correto, e o status `SOLUCIONADO` continua informando ao
jogador que a **própria** acusação estava certa.
_Implementação:_ `investigation.service.ts` (`ensureInProgress`, `start`), `investigation.model.ts`
(índices), `investigation.mapper.ts` e `scoring.service.ts` (`canRevealSolution`,
`SOLUTION_REVEAL_MIN_SCORE`).

## 10. Histórico e reinício de missões

### Novas tentativas (RN08)

- Cada missão aceita **várias tentativas** por jogador, numeradas em sequência (`attemptNumber`
  1, 2, 3...), mas **no máximo uma `EM_ANDAMENTO`** por jogador e missão.
- Uma nova tentativa começa do zero: nenhuma evidência analisada, nenhuma dica e nenhuma acusação.
  Tentativas encerradas nunca são reabertas, substituídas ou modificadas, e seus relatórios
  continuam acessíveis pelo histórico.
- A regra é garantida no banco por um **índice único parcial** (`userId + missionId` apenas para
  `status: EM_ANDAMENTO`) e por um índice único de numeração
  (`userId + missionId + attemptNumber`). Em requisições simultâneas, apenas uma criação vence; as
  demais recebem `409 INVESTIGATION_ALREADY_EXISTS` com `details.investigationId` da tentativa a
  continuar (ou, em corridas raras, `409 CONCURRENT_UPDATE`) — nunca `500`.
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

## 11. Estrutura do projeto

```
misteriobox/
├── .github/
│   └── workflows/
│       └── ci.yml           # pipeline de integração contínua
├── artefatos_de_teste/      # artefatos de qualidade da equipe de QA
├── backend/
│   ├── src/
│   │   ├── config/          # variáveis de ambiente e caminhos
│   │   ├── controllers/     # camada HTTP (sem regra de negócio)
│   │   ├── database/
│   │   │   ├── connection.ts        # MongoDB Memory Server
│   │   │   └── seed/                # usuários, missões e validação de integridade
│   │   ├── errors/          # AppError, códigos de erro e erros do banco
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
│   │   ├── components/      # layout, guardas de rota, diálogo, badges, capas, feedback
│   │   ├── context/         # sessão do jogador
│   │   ├── pages/           # login, cadastro, catálogo, histórico, investigação, resultado
│   │   ├── styles/          # CSS responsivo organizado por área
│   │   ├── types/           # tipos das respostas da API
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── docs/
│   └── openapi.yaml         # especificação OpenAPI 3 (Swagger)
├── .gitignore
├── .prettierrc.json
├── package.json             # scripts e workspaces
└── README.md
```

## 12. Lint, Prettier, build e testes

| Script                                         | Ação                                               |
| ---------------------------------------------- | -------------------------------------------------- |
| `npm install` (ou `npm run setup`)             | Instala as dependências de backend e frontend      |
| `npm run dev`                                  | Backend + frontend em modo desenvolvimento         |
| `npm run dev:backend` / `npm run dev:frontend` | Cada parte separadamente                           |
| `npm run lint` / `npm run lint:fix`            | ESLint em backend e frontend                       |
| `npm run format` / `npm run format:check`      | Prettier (corrigir / apenas verificar)             |
| `npm run build`                                | Build de produção dos dois projetos                |
| `npm test`                                     | Testes automatizados do backend e do frontend      |
| `npm run test:e2e`                             | Testes de ponta a ponta (Playwright), após o build |
| `npm start`                                    | Executa o build (API + `vite preview`)             |

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

O build gera `backend/dist` (JavaScript compilado) e `frontend/dist` (site estático).

Testes automatizados (Vitest):

- **Backend** (`backend/tests/`): testes unitários das validações e do serviço de senha e testes de
  integração da API com Supertest e MongoDB em memória — política do nome, normalização de
  espaços externos (regressão do B03), limites de campos, limite de bytes do bcrypt, rejeição de
  operadores do MongoDB e respostas sempre em JSON.
- **Frontend** (`frontend/src/**/*.test.ts`): as mesmas regras de validação do cadastro, para
  manter frontend e backend consistentes, e as regras de expiração da sessão.
- Backend também cobre sessão (inatividade, renovação, limite de 8 h, preservação da investigação
  após novo login) e o contrato de `Content-Type` (`415`, sem efeitos no banco).

Na primeira execução, os testes de integração baixam o binário do MongoDB (~70 MB).

Testes de ponta a ponta (Playwright, pasta `e2e/`) rodam em um navegador real contra o build da
API (porta 3400) e o `vite preview` (porta 4173) — sem conflitar com `npm run dev`:

```bash
npx playwright install chromium
```

```bash
npm run build && npm run test:e2e
```

Cobrem a sessão (expiração por inatividade, retorno pelo histórico e à aba, logout, logout em
outra aba, retomada da investigação) e o menu da investigação em 320, 420, 441, 463, 647, 664,
681, 768 e 1280 px de largura.

## 13. Pipeline de integração contínua (CI)

O workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda no **GitHub Actions** a
cada `push` e `pull request` para a branch `main`:

1. `ubuntu-latest` com **Node.js 24 (LTS)** e cache do npm;
2. `npm ci` (instalação reprodutível a partir do `package-lock.json`);
3. `npm run lint` — ESLint no backend e no frontend;
4. `npm run format:check` — verificação de formatação com Prettier;
5. `npm run build -w backend` — compilação TypeScript da API;
6. `npm run build -w frontend` — type-check e build do Vite;
7. `npm run test -w backend` — testes unitários e de integração da API (Vitest + Supertest);
8. `npm run test -w frontend` — testes das validações do frontend (Vitest);
9. `npm run typecheck:e2e` — verificação de tipos dos testes de ponta a ponta;
10. `npm run test:e2e` — testes de ponta a ponta com Playwright (Chromium); em caso de falha, o
    relatório e os rastros ficam disponíveis como artefato da execução.

O pipeline não depende de nenhuma aplicação hospedada: os testes sobem a API, o MongoDB em
memória e o site dentro do próprio runner. A variável `MONGOMS_DISABLE_POSTINSTALL=1` evita
baixar o binário do MongoDB no `npm ci`; ele é obtido pelos testes e guardado em cache entre
execuções.

## 14. Limitações conhecidas

- Os dados existem **somente enquanto o backend estiver em execução**. Ao reiniciar a API (inclusive
  quando o modo `dev` recarrega após uma alteração de código), cadastros, progresso e histórico são
  perdidos e os dados demonstrativos são recriados.
- O salvamento automático e o **histórico de tentativas** sobrevivem a logout, fechamento do
  navegador e novo login, **mas não são persistência permanente**.
- Após reiniciar a API, um token salvo no navegador deixa de ser válido e o site pede novo login.
- A primeira execução precisa de internet para baixar o binário do MongoDB.
- Os testes automatizados cobrem validações do cadastro, segurança de entrada, sessão e o menu da
  investigação; os demais fluxos ainda são verificados manualmente.
- Logout sem revogação no servidor: um token copiado antes do logout vale até expirar (no máximo
  30 min sem renovação).
- A aplicação não está hospedada: é executada apenas localmente.

### Preparação para testes (QA)

- Regras de negócio isoladas em funções puras (`scoring.service.ts`, `evidence-rules.ts`) e em
  services sem dependência da interface.
- Dados demonstrativos previsíveis e recriados a cada inicialização.
- Códigos de erro estáveis (`error.code`) em todas as respostas de falha.
- Atributos `data-testid` nos elementos relevantes (ex.: `login-email`, `mission-card-missao-001`,
  `mission-action-missao-001`, `evidence-analyze-ev-01`, `hint-request`, `accusation-submit`,
  `abandon-dialog-confirm`, `result-score`, `result-classification`, `nav-history`,
  `detective-panel`, `stat-available`, `stat-in-progress`, `stat-solved`,
  `mission-last-report-missao-001`, `history-list`, `history-item-<id>`, `history-score-<id>`,
  `history-action-<id>`, `history-empty`, `case-nav`, `case-nav-secao-<seção>`).
- A pasta [`artefatos_de_teste/`](artefatos_de_teste) reúne os artefatos de qualidade da equipe
  de QA. Os documentos `.docx` (plano, condições de teste, relatórios de sessão e de defeitos) são
  mantidos apenas localmente até serem revisados para publicação.

## 15. Caráter acadêmico e experimental

A MistérioBox foi desenvolvida como **projeto acadêmico**, com fins de estudo de desenvolvimento
Web, arquitetura de APIs REST, qualidade de software e testes. É um projeto **experimental**:

- todas as histórias, personagens, nomes e empresas são **fictícios**; qualquer semelhança é mera
  coincidência;
- os usuários e credenciais de demonstração existem apenas para uso local;
- não há garantia de funcionamento em produção, suporte ou persistência de dados;
- contribuições e sugestões são bem-vindas por meio de _issues_ e _pull requests_.
