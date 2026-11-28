# MistérioBox

**MistérioBox** é uma plataforma Web de investigação interativa. O jogador assume o papel de
detetive, examina evidências, confronta depoimentos e, ao final, acusa um suspeito. A acusação gera
uma pontuação e uma classificação de detetive.

O projeto é **acadêmico e experimental**: foi construído para estudar desenvolvimento Web,
arquitetura de APIs REST, qualidade de software e testes. Todas as histórias, personagens, nomes e
empresas são fictícios.

> Esta Wiki não revela soluções das missões.

**Aplicação publicada:** [misteriobox.vercel.app](https://misteriobox.vercel.app)

## Visão rápida

| Item              | Resumo                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| Produto           | Catálogo com 10 missões (3 fáceis, 3 médias, 4 difíceis), histórico e novas tentativas                                |
| Frontend          | React + TypeScript + Vite                                                                                             |
| Backend           | API REST com Node.js, Express 5 e TypeScript, documentada em OpenAPI 3 (Swagger UI)                                   |
| Banco             | MongoDB Atlas em Production; Preview exige um banco Atlas separado; MongoDB em memória no ambiente local e nos testes |
| Publicação        | Vercel (site estático + função serverless da API)                                                                     |
| Qualidade         | ESLint, Prettier, Vitest, Supertest, Playwright, Mocha/Chai e GitHub Actions                                          |
| Regras de negócio | RN01 a RN08, todas validadas no backend                                                                               |

## Páginas

1. [Funcionalidades e fluxo do jogador](Funcionalidades-e-Fluxo-do-Jogador)
2. [Arquitetura e tecnologias](Arquitetura-e-Tecnologias)
3. [Regras de negócio e critérios de aceitação](Regras-de-Negocio-e-Criterios-de-Aceitacao)
4. [Estratégia de testes e Quality Engineering](Estrategia-de-Testes-e-Quality-Engineering)
5. [Testes automatizados e ferramentas](Testes-Automatizados-e-Ferramentas)
6. [Integração contínua e implantação](Integracao-Continua-e-Implantacao)
7. [Gestão de defeitos, riscos e rastreabilidade](Gestao-de-Defeitos-Riscos-e-Rastreabilidade)
8. [Segurança e privacidade](Seguranca-e-Privacidade)
9. [Execução local e contribuição](Execucao-Local-e-Contribuicao)

## Documentação de QA — planejamento original

Documentos autorais de planejamento e execução de testes, publicados na íntegra (convertidos de
DOCX, sem resumo):

- [Plano e Estratégia de Testes — Completo](QA-Plano-e-Estrategia-de-Testes-Completo) — épicos,
  histórias com estimativas, condições de teste com resultado esperado e camada, técnicas, missões
  exploratórias, testes não funcionais e automação.
- [EP01 — Gestão de Usuários e Autenticação](QA-EP01-Gestao-de-Usuarios-e-Autenticacao) e
  [EP02 — Catálogo e Seleção de Missões](QA-EP02-Catalogo-e-Selecao-de-Missoes).
- [Condições de Teste](QA-Condicoes-de-Teste) e os cinco relatórios de sessão exploratória (menu
  lateral).
- [Rastreabilidade acadêmica](QA-Rastreabilidade-Academica) e
  [Conferência e observações](QA-Conferencia-e-Observacoes).

As demais páginas desta Wiki descrevem a implementação atual e complementam esses documentos.

## Documentos do repositório

Na raiz do repositório de apresentação:

- `README.md` — visão geral, regras de negócio e execução local.
- `docs/implantacao.md` — guia de implantação na Vercel com MongoDB Atlas.
- `docs/openapi.yaml` — contrato da API (também disponível no Swagger UI, em `/api-docs`).
