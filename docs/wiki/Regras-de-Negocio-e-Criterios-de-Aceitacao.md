# Regras de negócio e critérios de aceitação

[← Início](Home) · Anterior: [Arquitetura](Arquitetura-e-Tecnologias) · Próxima:
[Estratégia de testes](Estrategia-de-Testes-e-Quality-Engineering)

A aplicação tem exatamente oito regras de negócio (RN01–RN08), todas validadas no backend. Cada
regra abaixo traz critérios de aceitação no formato _Dado / Quando / Então_ e os testes que os
verificam, ou a lacuna de automação quando ela existe. Testes para todas as lacunas listadas aqui
estão em revisão nos pull requests
[#34](https://github.com/RoxaneNayara/misteriobox/pull/34) (API) e
[#35](https://github.com/RoxaneNayara/misteriobox/pull/35) (interface); esta página será
atualizada quando forem integrados. O texto normativo completo está na
[seção 9 do README](https://github.com/RoxaneNayara/misteriobox/blob/main/README.md#9-regras-de-negócio-rn01-a-rn08).

## RN01 — Acesso autenticado e isolamento das investigações

Somente jogadores autenticados iniciam investigações, e cada jogador acessa apenas as próprias.

- **Dado** um visitante sem token, **quando** consulta `/api/investigations`, **então** recebe
  `401`.
- **Dado** o jogador A, **quando** consulta a investigação do jogador B, **então** recebe `403`.
- **Dado** um jogador autenticado, **quando** consulta o histórico, **então** vê apenas as próprias
  tentativas (o endpoint não aceita identificador de usuário).

Testes: `tests/gestaodeusuarios/*/us03-ct02-acesso-protegido.*` e `e2e/session.spec.ts` (`401` e
páginas protegidas). **Lacuna:** o `403` para investigação de outro jogador não tem teste
automatizado.

## RN02 — Classificação das missões por dificuldade

Cada missão tem obrigatoriamente um nível: `FACIL`, `MEDIO` ou `DIFICIL`.

- **Dado** o catálogo publicado, **então** há 10 missões na distribuição 3/3/4, exibidas em três
  setores.

Testes: `backend/tests/unit/mission-catalog.test.ts`, `e2e/catalog-sectors.spec.ts`.

## RN03 — Desbloqueio de evidências mediante pré-requisitos

- **Dado** uma evidência com pré-requisitos não analisados, **quando** o jogador tenta analisá-la,
  **então** recebe `422 EVIDENCE_LOCKED` e o conteúdo da evidência não é enviado.
- **Dado** que todos os pré-requisitos foram analisados, **então** a evidência fica disponível.

Testes: `backend/tests/integration/mission-catalog-flow.test.ts`,
`backend/tests/unit/mission-catalog.test.ts` (cadeias sem ciclos e evidência decisiva alcançável).

## RN04 — Acusação após pelo menos três evidências

- **Dado** menos de três evidências analisadas, **quando** o jogador acusa, **então** recebe
  `422 INSUFFICIENT_EVIDENCES`.
- **Dado** uma evidência não analisada ou um suspeito inexistente na acusação, **então** recebe
  `422 EVIDENCE_NOT_ANALYZED` ou `422 INVALID_SUSPECT`.
- **Dado** uma tentativa já acusada, **quando** acusa de novo, **então** recebe `409`.

Testes: `backend/tests/integration/mission-catalog-flow.test.ts` e
`backend/tests/integration/solution-reveal.test.ts` exercitam acusações válidas. **Lacuna:** os
códigos `INSUFFICIENT_EVIDENCES`, `EVIDENCE_NOT_ANALYZED` e `INVALID_SUSPECT` e a segunda acusação
não têm teste automatizado dedicado.

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

Testes: `backend/tests/unit/solution-reveal.test.ts` (pontuações alcançáveis),
`backend/tests/integration/solution-reveal.test.ts`.

## RN06 — Salvamento automático e retomada

- **Dado** uma investigação em andamento, **quando** o jogador sai, fecha o navegador ou a sessão
  expira, **então**, após novo login, retoma do mesmo ponto. Logout não é abandono.

Testes: `backend/tests/integration/session-and-content-type.test.ts`, `e2e/session.spec.ts`,
`backend/tests/integration/persistence.test.ts` (dados preservados após reinicializações com banco
persistente).

## RN07 — Abandono voluntário

- **Dado** uma investigação em andamento, **quando** o jogador confirma o abandono, **então** o
  status passa a `ABANDONADO`, sem pontuação, e a tentativa não pode ser retomada.
- **Quando** o jogador cancela a confirmação, **então** nada muda.

Testes: `backend/tests/integration/solution-reveal.test.ts` (abandonada nunca revela a solução).
**Lacuna:** o cancelamento da confirmação e a recusa de ações após o abandono são verificados
manualmente.

## RN08 — Finalização, histórico, novas tentativas e revelação da solução

- **Dado** uma tentativa encerrada, **quando** o jogador tenta analisar, pedir dica ou acusar,
  **então** recebe `409 INVESTIGATION_FINISHED`.
- **Dado** uma missão encerrada, **quando** o jogador inicia outra tentativa, **então** ela começa
  do zero e as anteriores permanecem inalteradas no histórico.
- **Dado** uma tentativa ativa, **quando** o jogador (ou requisições simultâneas) tenta iniciar
  outra da mesma missão, **então** recebe `409` com o identificador da tentativa a continuar — nunca
  `500`.
- **Dado** um relatório com **50 pontos ou mais**, **então** a solução é revelada; **abaixo de 50**,
  a API devolve `solution: null` e `solutionRevealed: false`. A regra vale também para relatórios
  antigos.

Testes: `backend/tests/integration/mission-catalog-flow.test.ts` (nova tentativa e histórico),
`backend/tests/integration/solution-reveal.test.ts` e `e2e/solution-reveal.spec.ts` (limite de 50
pontos, inclusive em relatórios antigos), `backend/tests/integration/persistence.test.ts` (índice
de tentativa ativa única). **Lacuna:** `409 INVESTIGATION_FINISHED` e as requisições simultâneas
não têm teste automatizado dedicado.

## Validação do cadastro

| Campo  | Regra                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| Nome   | 2 a 80 caracteres após remover espaços externos; letras (com acentos), espaços internos, hífens e apóstrofos |
| E-mail | Até 120 caracteres, formato válido; espaços externos removidos e letras em minúsculas                        |
| Senha  | 8 a 72 caracteres e no máximo 72 bytes, com letras e números; nunca é alterada                               |

Testes: `backend/tests/unit/auth.validator.test.ts`,
`backend/tests/integration/auth-and-input-security.test.ts`, `frontend/src/utils/validation.test.ts`,
`tests/gestaodeusuarios/*/us01-*`.
