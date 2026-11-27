# Gestão de defeitos, riscos e rastreabilidade

[← Início](Home) · Anterior: [Integração contínua](Integracao-Continua-e-Implantacao) · Próxima:
[Segurança e privacidade](Seguranca-e-Privacidade)

## Padrão de registro de defeitos

Os defeitos são registrados como Issues no repositório de desenvolvimento (privado), com o título
`[Bxx] <origem> — descrição`, em que a origem é o caso de teste (por exemplo `US01-CT04`), a
característica de qualidade (`ISO25010`) ou a área (`Acessibilidade`, `Automação`, `Conteúdo`).

Cada registro contém: funcionalidade, comportamento observado e esperado, passos para reproduzir,
ambiente, evidências, severidade e prioridade com justificativa, causa raiz, correção (pull request
e commit), cenários e resultado do reteste.

| Label                                                              | Uso                                      |
| ------------------------------------------------------------------ | ---------------------------------------- |
| `bug`, `qa`                                                        | Defeito identificado pelo processo de QA |
| `api`, `authentication`, `security`, `responsive`, `accessibility` | Área afetada                             |
| `needs-retest`                                                     | Corrigido, aguardando reteste            |
| `verified`                                                         | Reteste aprovado; registro encerrado     |

Regras do ciclo de vida:

- Pull requests **não** usam `Closes #`: o merge não encerra o defeito.
- O registro é encerrado somente após o reteste, com data, resultado obtido e esperado e referência
  à correção.
- Evidências visuais só são citadas como anexadas quando o upload foi confirmado.

## Defeitos registrados

Os identificadores `Bxx` são estáveis e aparecem também nos nomes e comentários dos testes de
regressão. Os registros completos ficam no repositório de desenvolvimento, que não é público.

| ID  | Origem         | Resumo                                                        | Teste de regressão                                 | Situação                  |
| --- | -------------- | ------------------------------------------------------------- | -------------------------------------------------- | ------------------------- |
| B01 | US01-CT04      | Caracteres especiais aceitos no campo Nome                    | `auth.validator`, `auth-and-input-security`        | verificado                |
| B02 | US01-CT05      | Nome longo sem espaços quebrava o layout                      | `navigation-responsive` (varredura com nome longo) | verificado                |
| B03 | US01-CT04      | Espaços no início e no fim de nome e e-mail                   | `auth.validator`, `auth-and-input-security`        | corrigido; registro local |
| B04 | US03-CT02      | Acesso à sessão ao voltar pelo histórico do navegador         | `session` (E2E), `session-and-content-type`        | verificado                |
| B05 | ISO25010       | Menu secundário da investigação sumia ou ficava cortado       | `investigation-nav`                                | verificado                |
| B06 | API            | Cadastro aceito com `Content-Type` fora do contrato           | `session-and-content-type`                         | verificado                |
| B07 | ISO25010       | Botão Sair isolado em uma linha do cabeçalho                  | `header-back-to-top`                               | verificado                |
| B08 | ISO25010       | Menu da investigação em duas linhas em telas pequenas         | `navigation-responsive`                            | verificado                |
| B09 | Acessibilidade | Opção focada pelo teclado parcialmente oculta                 | `navigation-responsive` (teclado)                  | verificado                |
| B10 | ISO25010       | "Voltar ao topo" cobria o rodapé                              | `navigation-responsive`, `header-back-to-top`      | verificado                |
| B11 | Investigação   | Mensagens de dica e evidência permaneciam fixas               | `investigation-feedback`                           | verificado                |
| B12 | Automação      | Teste instável por corrida entre relógio simulado e renovação | `session` (E2E, estabilizado)                      | verificado                |
| B13 | Conteúdo       | Cronologia incoerente em uma missão difícil                   | — (reteste documental)                             | verificado                |

## Rastreabilidade

| Requisito                          | Implementação principal                                                                                | Testes                                                                                                         | Defeitos          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------- |
| US01 — Cadastro                    | `validators/auth.validator.ts`, `frontend/src/utils/validation.ts`                                     | `auth.validator`, `validation-messages`, `auth-and-input-security`, `validation` (frontend), `us01-*`          | B01–B03           |
| US02 — Login                       | `services/auth.service.ts`, `services/password.service.ts`                                             | `password.service`, `auth-and-input-security`, `navigation-redirect`, `us02-ct01-*`                            | —                 |
| US03 — Sessão e acesso protegido   | `middlewares/authenticate.ts`, `context/AuthProvider.tsx`, `RouteGuards.tsx`                           | `session-and-content-type`, `session` (E2E), `navigation-redirect`, `redirect` (frontend), `us03-ct02-*`       | B04, B12          |
| Contrato da API                    | `middlewares/content-type.ts`, `middlewares/validate.ts`, `docs/openapi.yaml`                          | `session-and-content-type`, `validation-messages`                                                              | B06               |
| RN01 — Isolamento entre jogadores  | `services/investigation.service.ts` (`loadOwnedInvestigation`)                                         | `investigation-access-and-rules`                                                                               | —                 |
| RN02, RN03 — Catálogo e evidências | `database/seed/mission-integrity.ts`, `services/evidence-rules.ts`                                     | `mission-catalog`, `published-catalog`, `mission-catalog-flow`, `catalog-sectors`                              | B13               |
| RN04 — Acusação                    | `services/investigation.service.ts` (`accuse`)                                                         | `investigation-access-and-rules`, `solution-reveal`                                                            | —                 |
| RN05, RN08 — Pontuação e solução   | `services/scoring.service.ts`, `mappers/investigation.mapper.ts`                                       | `solution-reveal` (unitário, integração e E2E)                                                                 | —                 |
| RN06 — Retomada                    | `services/investigation.service.ts`, `repositories/investigation.repository.ts`                        | `session-and-content-type`, `persistence`, `session`, `history-persistence`                                    | —                 |
| RN07 — Abandono                    | `services/investigation.service.ts` (`abandon`), `InvestigationPage.tsx`                               | `abandon-confirmation`, `investigation-access-and-rules`                                                       | —                 |
| RN08 — Encerramento e tentativas   | `services/investigation.service.ts` (`ensureInProgress`, `start`), índices do modelo                   | `investigation-access-and-rules`, `mission-catalog-flow`, `persistence`                                        | —                 |
| Responsividade e acessibilidade    | `styles/`, `components/`, `pages/investigation/`                                                       | `navigation-responsive`, `investigation-nav`, `header-back-to-top`, `investigation-feedback`, `catalog-layout` | B02, B05, B07–B11 |
| Segurança de logs e ambientes      | `config/env.ts`, `errors/database-errors.ts`, `middlewares/error-handler.ts`, `seed/demo-passwords.ts` | `env`, `database-error-diagnostics`, `log-safety`, `vercel-handler-unavailable`, `database-setup-failures`     | —                 |

## Riscos conhecidos

| Risco                                                           | Impacto                                                         | Tratamento atual                                                                       |
| --------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Plano gratuito do Atlas sem backup automático                   | Perda de dados em incidente no banco                            | Sem migrações destrutivas; exportação manual recomendada no guia de implantação        |
| Acesso de rede do Atlas liberado para qualquer IP (`0.0.0.0/0`) | Banco exposto a tentativas de conexão                           | Usuário por ambiente com `readWrite` só no próprio banco; senha gerada pelo Atlas; TLS |
| Logout sem revogação do token no servidor                       | Token copiado vale até expirar (no máximo 30 min sem renovação) | Documentado; janelas de inatividade e limite absoluto                                  |
| Alteração de conteúdo de missão já publicada                    | Inconsistência em tentativas em andamento                       | Identificadores congelados por teste; regras de atualização no guia de implantação     |
| Status `SOLUCIONADO` com 30 ou 40 pontos                        | O jogador sabe que acertou o suspeito sem ver a solução         | Aceito como regra de produto (RN08)                                                    |
| Soluções das missões no código de desenvolvimento               | Spoilers para quem lê os dados                                  | Repositório de desenvolvimento privado; apresentação pública sem soluções              |
| Novas vulnerabilidades em dependências                          | Exposição a falhas de terceiros                                 | Auditoria de 27/11/2026 sem avisos; repetir `npm audit` periodicamente                 |
| Sem limite de tentativas de login                               | Tentativas repetidas de senha                                   | Melhoria planejada (ver [Segurança e privacidade](Seguranca-e-Privacidade))            |
