# Gestão de defeitos, riscos e rastreabilidade

[← Início](Home) · Anterior: [Integração contínua](Integracao-Continua-e-Implantacao) · Próxima:
[Execução local e contribuição](Execucao-Local-e-Contribuicao)

## Padrão de registro de defeitos

Defeitos são registrados como Issues do GitHub com o título `[Bxx] <origem> — descrição`, em que a
origem é o caso de teste (por exemplo `US01-CT04`), a característica de qualidade (`ISO25010`) ou a
área (`Acessibilidade`, `Automação`, `Conteúdo`).

Cada Issue contém: funcionalidade, comportamento observado e esperado, passos para reproduzir,
ambiente, evidências, severidade e prioridade com justificativa, causa raiz, correção (pull request
e commit), cenários e resultado do reteste.

| Label                                                              | Uso                                      |
| ------------------------------------------------------------------ | ---------------------------------------- |
| `bug`, `qa`                                                        | Defeito identificado pelo processo de QA |
| `api`, `authentication`, `security`, `responsive`, `accessibility` | Área afetada                             |
| `needs-retest`                                                     | Corrigido, aguardando reteste            |
| `verified`                                                         | Reteste aprovado; Issue encerrada        |

Regras do ciclo de vida:

- Pull requests **não** usam `Closes #`: o merge não encerra o defeito.
- A Issue é encerrada somente após o reteste, com data, resultado obtido e esperado e referência à
  correção.
- Evidências visuais só são citadas como anexadas quando o upload foi confirmado.

## Defeitos registrados

| ID  | Issue                                                        | Origem         | Resumo                                                        | Situação                        |
| --- | ------------------------------------------------------------ | -------------- | ------------------------------------------------------------- | ------------------------------- |
| B01 | [#5](https://github.com/RoxaneNayara/misteriobox/issues/5)   | US01-CT04      | Caracteres especiais aceitos no campo Nome                    | verificado                      |
| B02 | [#6](https://github.com/RoxaneNayara/misteriobox/issues/6)   | US01-CT05      | Nome longo sem espaços quebrava o layout                      | verificado                      |
| B03 | —                                                            | US01-CT04      | Espaços no início e no fim de nome e e-mail (registro local)  | corrigido; teste de regressão   |
| B04 | [#7](https://github.com/RoxaneNayara/misteriobox/issues/7)   | US03-CT02      | Acesso à sessão ao voltar pelo histórico do navegador         | verificado                      |
| B05 | [#8](https://github.com/RoxaneNayara/misteriobox/issues/8)   | ISO25010       | Menu secundário da investigação sumia ou ficava cortado       | verificado                      |
| B06 | [#9](https://github.com/RoxaneNayara/misteriobox/issues/9)   | API            | Cadastro aceito com `Content-Type` fora do contrato           | verificado                      |
| B07 | [#15](https://github.com/RoxaneNayara/misteriobox/issues/15) | ISO25010       | Botão Sair isolado em uma linha do cabeçalho                  | verificado                      |
| B08 | [#16](https://github.com/RoxaneNayara/misteriobox/issues/16) | ISO25010       | Menu da investigação em duas linhas em telas pequenas         | verificado                      |
| B09 | [#17](https://github.com/RoxaneNayara/misteriobox/issues/17) | Acessibilidade | Opção focada pelo teclado parcialmente oculta                 | verificado                      |
| B10 | [#18](https://github.com/RoxaneNayara/misteriobox/issues/18) | ISO25010       | "Voltar ao topo" cobria o rodapé                              | verificado                      |
| B11 | [#19](https://github.com/RoxaneNayara/misteriobox/issues/19) | Investigação   | Mensagens de dica e evidência permaneciam fixas               | verificado                      |
| B12 | [#20](https://github.com/RoxaneNayara/misteriobox/issues/20) | Automação      | Teste instável por corrida entre relógio simulado e renovação | verificado                      |
| B13 | [#21](https://github.com/RoxaneNayara/misteriobox/issues/21) | Conteúdo       | Cronologia incoerente em uma missão difícil                   | verificado (reteste documental) |

> As Issues de defeitos de conteúdo podem citar detalhes de missões. Leia-as depois de jogar.

## Rastreabilidade

| Requisito                          | Implementação principal                                            | Testes                                                                                                                       | Defeitos          |
| ---------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| US01 — Cadastro                    | `validators/auth.validator.ts`, `utils/validation.ts` (frontend)   | `auth.validator.test.ts`, `auth-and-input-security.test.ts`, `us01-*`                                                        | B01–B03           |
| US02 — Login                       | `services/auth.service.ts`, `password.service.ts`                  | `password.service.test.ts`, `us02-ct01-*`                                                                                    | —                 |
| US03 — Sessão e acesso protegido   | `middlewares/authenticate.ts`, `context/AuthProvider.tsx`          | `session-and-content-type.test.ts`, `session.spec.ts`, `us03-ct02-*`                                                         | B04, B12          |
| Contrato da API                    | `middlewares/` (`Content-Type`), `docs/openapi.yaml`               | `session-and-content-type.test.ts`                                                                                           | B06               |
| RN02, RN03 — Catálogo e evidências | `seed/missions/`, `seed/mission-integrity.ts`, `evidence-rules.ts` | `mission-catalog.test.ts`, `mission-catalog-flow.test.ts`, `catalog-sectors.spec.ts`                                         | B13               |
| RN05, RN08 — Pontuação e solução   | `scoring.service.ts`, `investigation.mapper.ts`                    | `solution-reveal.test.ts` (unit e integração), `solution-reveal.spec.ts`                                                     | —                 |
| RN06 — Retomada                    | `investigation.service.ts`, `investigation.repository.ts`          | `session-and-content-type.test.ts`, `persistence.test.ts`, `session.spec.ts`                                                 | —                 |
| Responsividade e acessibilidade    | `styles/`, `components/`, `pages/investigation/`                   | `navigation-responsive.spec.ts`, `investigation-nav.spec.ts`, `header-back-to-top.spec.ts`, `investigation-feedback.spec.ts` | B02, B05, B07–B11 |

## Riscos conhecidos

| Risco                                                                                      | Impacto                                                         | Tratamento atual                                                                  |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Plano gratuito do Atlas sem backup automático                                              | Perda de dados em incidente no banco                            | Sem migrações destrutivas; exportação manual recomendada no guia de implantação   |
| Acesso de rede do Atlas liberado para qualquer IP (`0.0.0.0/0`)                            | Banco exposto a tentativas de conexão                           | Usuário por ambiente com `readWrite` só no próprio banco; senha gerada pelo Atlas |
| Logout sem revogação do token no servidor                                                  | Token copiado vale até expirar (no máximo 30 min sem renovação) | Documentado; janelas de inatividade e limite absoluto                             |
| Alteração de conteúdo de missão já publicada                                               | Inconsistência em tentativas em andamento                       | Identificadores congelados por teste; regras na seção 2.6 do guia                 |
| Status `SOLUCIONADO` com 30 ou 40 pontos                                                   | O jogador sabe que acertou o suspeito sem ver a solução         | Aceito como regra de produto (RN08)                                               |
| Código-fonte público contém as soluções das missões                                        | Spoilers para quem lê os dados                                  | Documentação pública sem soluções; aviso na página inicial                        |
| Dependências com vulnerabilidades conhecidas                                               | Exposição a falhas de terceiros                                 | Acompanhar `npm audit` e atualizar em pull requests próprios                      |
| Lacunas de automação (ver [Regras de negócio](Regras-de-Negocio-e-Criterios-de-Aceitacao)) | Regressões não detectadas pelo CI                               | Verificação manual; candidatas a novos testes                                     |
