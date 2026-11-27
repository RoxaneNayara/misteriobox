# Estratégia de testes e Quality Engineering

[← Início](Home) · Anterior: [Regras de negócio](Regras-de-Negocio-e-Criterios-de-Aceitacao) ·
Próxima: [Testes automatizados](Testes-Automatizados-e-Ferramentas)

## Princípios

1. **Regras no backend, provas no backend.** Como toda regra de negócio é executada na API, a maior
   parte da verificação acontece em testes de integração da API com banco real (MongoDB em memória).
2. **Cada defeito vira teste de regressão.** Os testes citam o defeito que protegem (B01, B03, B04,
   B06 …) — ver [Gestão de defeitos](Gestao-de-Defeitos-Riscos-e-Rastreabilidade).
3. **Contraprova.** Um teste novo de regressão deve falhar com o código antigo e passar com a
   correção; isso é registrado na descrição do pull request.
4. **Sem atalhos artificiais.** Pontuações de teste são obtidas jogando partidas reais pela API, sem
   gravar valores no banco; critérios de aceite não são enfraquecidos para um teste passar.
5. **Esperas por condição, não por tempo.** Testes de interface aguardam estados observáveis (fim
   de animação, texto visível) e usam relógio simulado para regras de tempo (inatividade de 30 min,
   notificação de 4 s).
6. **Nada de dados pessoais ou segredos.** Jogadores de teste usam o domínio reservado
   `example.com`; credenciais de teste são fictícias e exclusivas dos testes.

## Níveis e tipos de teste

| Nível / tipo                    | O que verifica                                                            | Ferramentas                             |
| ------------------------------- | ------------------------------------------------------------------------- | --------------------------------------- |
| Análise estática                | Padrões de código, acessibilidade em JSX, formatação, tipos               | ESLint, Prettier, TypeScript            |
| Unitário                        | Validações, pontuação, configuração por ambiente, integridade do catálogo | Vitest                                  |
| Integração da API               | Endpoints, regras RN01–RN08, sessão, segurança de entrada, persistência   | Vitest + Supertest + MongoDB em memória |
| Ponta a ponta (E2E)             | Fluxos no navegador, responsividade, teclado, sessão                      | Playwright (Chromium)                   |
| Suítes de QA por história       | Casos de teste US01–US03 (API e interface)                                | Mocha, Chai, Supertest; Playwright      |
| Testes exploratórios por sessão | Usabilidade, responsividade, compatibilidade, API                         | Relatórios de sessão                    |
| Smoke test pós-implantação      | Saúde, catálogo, rotas, proteção, cache (e fluxo com escrita opcional)    | `scripts/smoke-test.mjs`                |
| Reteste e aceite                | Confirmação manual da correção antes de encerrar um defeito               | Registro do defeito (Issues)            |

## Referências de qualidade

- **ISO/IEC/IEEE 29119-3** como base do Plano e Estratégia de Testes.
- **ISO/IEC 25010** para classificar defeitos de qualidade do produto (por exemplo, responsividade,
  usabilidade e compatibilidade, nos defeitos marcados como `ISO25010`).
- Histórias de usuário (US) e casos de teste (CT) identificados nos nomes dos testes, por exemplo
  `US01-CT04 — Cadastro com dados inválidos`.

Os documentos de QA em `.docx` (plano, condições de teste, relatórios de sessão e de defeitos) são
mantidos localmente e não fazem parte do repositório.

## Ciclo de um defeito

```
Teste (exploratório, automatizado ou CI) → Registro [Bxx] com evidências → Pull request com
correção + teste de regressão → CI aprovado → Reteste da responsável → Registro encerrado (verified)
```

O merge de um pull request **não** encerra o defeito: o registro só é encerrado depois do reteste. Detalhes
em [Gestão de defeitos, riscos e rastreabilidade](Gestao-de-Defeitos-Riscos-e-Rastreabilidade).

## Critérios de entrada e saída de uma entrega

| Momento    | Critério                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entrada    | Pull request com descrição, causa (para correções) e testes novos ou atualizados                                                                              |
| Saída      | CI aprovado (lint, formatação, build, testes unitários, integração, E2E e suítes de QA); revisão e aprovação da responsável; defeitos relacionados retestados |
| Publicação | Smoke test na URL publicada e verificação dos pontos do guia de implantação (`docs/implantacao.md`)                                                           |

## Cobertura das regras de negócio

As lacunas de automação identificadas na auditoria de qualidade foram cobertas por testes:

| Cenário                                                  | Prioridade | Teste                                    |
| -------------------------------------------------------- | ---------- | ---------------------------------------- |
| Acesso à investigação de outro jogador (`403`)           | P1         | `investigation-access-and-rules.test.ts` |
| Recusas da acusação (`422`, `400`) e segunda acusação    | P2         | `investigation-access-and-rules.test.ts` |
| Ações após encerramento por acusação ou abandono (`409`) | P2         | `investigation-access-and-rules.test.ts` |
| Requisições simultâneas para iniciar a mesma missão      | P2         | `investigation-access-and-rules.test.ts` |
| Cancelamento e confirmação do abandono                   | P3         | `abandon-confirmation.spec.ts`           |

Os testes verificam o comportamento já implementado, sem alterar regras, e não dependem das
soluções das missões. Antes de serem integrados, foram validados por mutação: com a verificação de
dono ou o bloqueio de encerramento desativados, eles falham. A matriz completa está em
[Regras de negócio](Regras-de-Negocio-e-Criterios-de-Aceitacao).
