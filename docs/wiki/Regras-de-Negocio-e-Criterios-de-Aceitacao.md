# Regras de negócio e critérios de aceitação

[← Início](Home) · Anterior: [Arquitetura](Arquitetura-e-Tecnologias) · Próxima:
[Estratégia de testes](Estrategia-de-Testes-e-Quality-Engineering)

A aplicação tem exatamente oito regras de negócio (RN01–RN08), todas validadas no backend. Cada
regra abaixo traz critérios de aceitação no formato _Dado / Quando / Então_ e os testes automatizados
que os verificam. O texto normativo completo das regras está no `README.md` do repositório, na
seção "Regras de negócio (RN01 a RN08)".

## Matriz de cobertura

| Regra | Unitários                              | Integração da API                                                                          | E2E (Playwright)                                           | Suítes de QA           |
| ----- | -------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ---------------------- |
| RN01  | —                                      | `investigation-access-and-rules`, `session-and-content-type`                               | `session`, `navigation-redirect`                           | `us03-ct02` (API e UI) |
| RN02  | `mission-catalog`, `published-catalog` | `mission-catalog-flow`                                                                     | `catalog-sectors`                                          | —                      |
| RN03  | `mission-catalog`                      | `mission-catalog-flow`                                                                     | —                                                          | —                      |
| RN04  | `validation-messages`                  | `investigation-access-and-rules`, `solution-reveal`                                        | —                                                          | —                      |
| RN05  | `solution-reveal`                      | `solution-reveal`, `mission-catalog-flow`                                                  | `solution-reveal`                                          | —                      |
| RN06  | —                                      | `session-and-content-type`, `persistence`                                                  | `session`, `history-persistence`, `investigation-feedback` | —                      |
| RN07  | —                                      | `investigation-access-and-rules`, `solution-reveal`                                        | `abandon-confirmation`                                     | —                      |
| RN08  | `solution-reveal`                      | `investigation-access-and-rules`, `solution-reveal`, `mission-catalog-flow`, `persistence` | `solution-reveal`                                          | —                      |

Nomes sem extensão. Pastas: `backend/tests/unit/`, `backend/tests/integration/`, `e2e/` e
`tests/gestaodeusuarios/`. Detalhes de cada arquivo em
[Testes automatizados e ferramentas](Testes-Automatizados-e-Ferramentas).

## RN01 — Acesso autenticado e isolamento das investigações

Somente jogadores autenticados iniciam investigações, e cada jogador acessa apenas as próprias.

- **Dado** um visitante sem token, **quando** consulta `/api/investigations`, **então** recebe
  `401`.
- **Dado** o jogador A, **quando** tenta ler, analisar, pedir dica, abandonar, acusar ou ver o
  relatório da investigação do jogador B, **então** recebe `403` e a investigação não muda.
- **Dado** um jogador autenticado, **quando** consulta o histórico, **então** vê apenas as próprias
  tentativas (o endpoint não aceita identificador de usuário).
- **Dado** um identificador inexistente, **então** recebe `404`; malformado, `400`.

**Cobertura:** `investigation-access-and-rules.test.ts` (403 em todas as ações, sem efeito
colateral, e histórico isolado), `us03-ct02-acesso-protegido` (API e interface), `session.spec.ts`
e `navigation-redirect.spec.ts` (páginas protegidas e retorno após o login).

## RN02 — Classificação das missões por dificuldade

Cada missão tem obrigatoriamente um nível: `FACIL`, `MEDIO` ou `DIFICIL`.

- **Dado** o catálogo publicado, **então** há 10 missões na distribuição 3/3/4, exibidas em três
  setores.

**Cobertura:** `mission-catalog.test.ts`, `published-catalog.test.ts` (identificadores do catálogo
publicado não mudam), `mission-catalog-flow.test.ts`, `catalog-sectors.spec.ts`.

## RN03 — Desbloqueio de evidências mediante pré-requisitos

- **Dado** uma evidência com pré-requisitos não analisados, **quando** o jogador tenta analisá-la,
  **então** recebe `422 EVIDENCE_LOCKED` e o conteúdo da evidência não é enviado.
- **Dado** que todos os pré-requisitos foram analisados, **então** a evidência fica disponível.

**Cobertura:** `mission-catalog-flow.test.ts` (bloqueio pela API) e `mission-catalog.test.ts`
(cadeias sem ciclos e evidência decisiva alcançável).

## RN04 — Acusação após pelo menos três evidências

- **Dado** menos de três evidências analisadas, **quando** o jogador acusa, **então** recebe
  `422 INSUFFICIENT_EVIDENCES`, com o número de evidências analisadas e o mínimo exigido.
- **Dado** um suspeito que não pertence à missão, **então** recebe `422 INVALID_SUSPECT`.
- **Dado** uma evidência não analisada, **então** recebe `422 EVIDENCE_NOT_ANALYZED`.
- **Dado** um corpo com campos extras (como `score`) ou vazio, **então** recebe `400`.
- **Em todos esses casos**, a investigação continua `EM_ANDAMENTO`.
- **Dado** uma tentativa já acusada, **quando** acusa de novo, **então** recebe
  `409 INVESTIGATION_FINISHED`.

**Cobertura:** `investigation-access-and-rules.test.ts` (todas as recusas acima e a segunda
acusação), `validation-messages.test.ts` (mensagens de campo ausente e campos extras),
`solution-reveal.test.ts` (acusações válidas).

## RN05 — Pontuação e classificação

| Critério                                             | Pontos  |
| ---------------------------------------------------- | ------- |
| Suspeito correto                                     | +70     |
| Evidência decisiva correta (só com suspeito correto) | +30     |
| Cada dica utilizada                                  | −10     |
| Mínimo / máximo                                      | 0 / 100 |

| Faixa    | Classificação             |
| -------- | ------------------------- |
| 90 a 100 | Detetive Mestre           |
| 70 a 89  | Investigador Experiente   |
| 40 a 69  | Detetive Aprendiz         |
| 0 a 39   | Investigação Inconclusiva |

Exemplos (sem relação com uma missão específica):

| Acusação                                  | Dicas | Pontuação | Classificação             |
| ----------------------------------------- | ----- | --------- | ------------------------- |
| Suspeito correto + evidência decisiva     | 0     | 100       | Detetive Mestre           |
| Suspeito correto + evidência não decisiva | 2     | 50        | Detetive Aprendiz         |
| Suspeito correto + evidência não decisiva | 3     | 40        | Detetive Aprendiz         |
| Suspeito incorreto                        | 0     | 0         | Investigação Inconclusiva |

- **Dado** que o frontend envia `score`, **então** o valor é recusado: a pontuação é calculada só no
  backend.

**Cobertura:** `solution-reveal.test.ts` (unitário: pontuações alcançáveis; integração: partidas
reais pela API, sem pontuação injetada), `mission-catalog-flow.test.ts`, `solution-reveal.spec.ts`.

## RN06 — Salvamento automático e retomada

- **Dado** uma investigação em andamento, **quando** o jogador sai, fecha o navegador ou a sessão
  expira, **então**, após novo login, retoma do mesmo ponto. Logout não é abandono.

**Cobertura:** `session-and-content-type.test.ts`, `persistence.test.ts` (dados preservados após
reinicializações com banco persistente), `session.spec.ts`, `history-persistence.spec.ts`,
`investigation-feedback.spec.ts` (progresso salvo após cada ação).

## RN07 — Abandono voluntário

- **Dado** uma investigação em andamento, **quando** o jogador confirma o abandono, **então** o
  status passa a `ABANDONADO`, sem pontuação, e a tentativa não pode ser retomada.
- **Quando** o jogador cancela a confirmação (botão ou Esc), **então** nenhuma requisição é enviada
  e a investigação continua em andamento.
- **Dado** uma tentativa abandonada, **quando** o jogador tenta qualquer ação, **então** recebe
  `409 INVESTIGATION_FINISHED`.

**Cobertura:** `abandon-confirmation.spec.ts` (cancelar e confirmar pela interface),
`investigation-access-and-rules.test.ts` (ações recusadas após o abandono e nova tentativa do
zero), `solution-reveal.test.ts` (abandonada nunca revela a solução).

## RN08 — Finalização, histórico, novas tentativas e revelação da solução

- **Dado** uma tentativa encerrada (por acusação ou abandono), **quando** o jogador tenta analisar,
  pedir dica, abandonar ou acusar, **então** recebe `409 INVESTIGATION_FINISHED` e o progresso não
  muda.
- **Dado** uma missão encerrada, **quando** o jogador inicia outra tentativa, **então** ela começa
  do zero e as anteriores permanecem inalteradas no histórico.
- **Dado** uma tentativa ativa, **quando** o jogador, ou várias requisições simultâneas, tenta
  iniciar outra da mesma missão, **então** só uma tentativa é criada e as demais recebem `409`,
  nunca `500`.
- **Dado** um relatório com **50 pontos ou mais**, **então** a solução é revelada; **abaixo de 50**,
  a API devolve `solution: null` e `solutionRevealed: false`. A regra vale também para relatórios
  antigos.

**Cobertura:** `investigation-access-and-rules.test.ts` (bloqueio após encerramento e 8 requisições
simultâneas), `solution-reveal.test.ts` e `solution-reveal.spec.ts` (limite de 50 pontos, inclusive
em relatórios antigos), `mission-catalog-flow.test.ts` (nova tentativa e histórico),
`persistence.test.ts` (índice de tentativa ativa única).

## Validação do cadastro

| Campo  | Regra                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| Nome   | 2 a 80 caracteres após remover espaços externos; letras (com acentos), espaços internos, hífens e apóstrofos |
| E-mail | Até 120 caracteres, formato válido; espaços externos removidos e letras em minúsculas                        |
| Senha  | 8 a 72 caracteres e no máximo 72 bytes, com letras e números; nunca é alterada                               |

**Cobertura:** `auth.validator.test.ts`, `validation-messages.test.ts`,
`auth-and-input-security.test.ts`, `frontend/src/utils/validation.test.ts` e
`us01-ct01`/`us01-ct04` (API e interface).

## Melhorias planejadas (não implementadas)

Estas propostas dependem de decisão e **não fazem parte das regras atuais**:

- responder `404`, em vez de `403`, para investigações de outros jogadores (evita inferir que um
  identificador existe; exige alterar o texto da RN01);
- testes de carga para requisições simultâneas em escala maior que a dos testes de integração.
