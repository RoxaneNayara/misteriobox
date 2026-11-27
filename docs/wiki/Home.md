# MistérioBox

**MistérioBox** é uma plataforma Web de investigação interativa. O jogador assume o papel de
detetive, examina evidências, confronta depoimentos e, ao final, acusa um suspeito. A acusação gera
uma pontuação e uma classificação de detetive.

O projeto é **acadêmico e experimental**: foi construído para estudar desenvolvimento Web,
arquitetura de APIs REST, qualidade de software e testes. Todas as histórias, personagens, nomes e
empresas são fictícios.

> Esta Wiki não revela soluções das missões. Para jogar sem spoilers, evite também ler os arquivos
> de dados em `backend/src/database/seed/missions/` e alguns testes que exercitam partidas
> completas.

## Visão rápida

| Item              | Resumo                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Produto           | Catálogo com 10 missões (3 fáceis, 3 médias, 4 difíceis), histórico e novas tentativas   |
| Frontend          | React + TypeScript + Vite                                                                |
| Backend           | API REST com Node.js, Express 5 e TypeScript, documentada em OpenAPI 3 (Swagger UI)      |
| Banco             | MongoDB Atlas em Production e Preview; MongoDB em memória no ambiente local e nos testes |
| Publicação        | Vercel (site estático + função serverless da API)                                        |
| Qualidade         | ESLint, Prettier, Vitest, Supertest, Playwright, Mocha/Chai e GitHub Actions             |
| Regras de negócio | RN01 a RN08, todas validadas no backend                                                  |

## Páginas

1. [Funcionalidades e fluxo do jogador](Funcionalidades-e-Fluxo-do-Jogador)
2. [Arquitetura e tecnologias](Arquitetura-e-Tecnologias)
3. [Regras de negócio e critérios de aceitação](Regras-de-Negocio-e-Criterios-de-Aceitacao)
4. [Estratégia de testes e Quality Engineering](Estrategia-de-Testes-e-Quality-Engineering)
5. [Testes automatizados e ferramentas](Testes-Automatizados-e-Ferramentas)
6. [Integração contínua e implantação](Integracao-Continua-e-Implantacao)
7. [Gestão de defeitos, riscos e rastreabilidade](Gestao-de-Defeitos-Riscos-e-Rastreabilidade)
8. [Execução local e contribuição](Execucao-Local-e-Contribuicao)

## Documentos do repositório

- [README](https://github.com/RoxaneNayara/misteriobox/blob/main/README.md) — referência completa
  do projeto.
- [Guia de implantação](https://github.com/RoxaneNayara/misteriobox/blob/main/docs/implantacao.md)
  — Vercel e MongoDB Atlas.
- [Especificação OpenAPI](https://github.com/RoxaneNayara/misteriobox/blob/main/docs/openapi.yaml)
  — contrato da API.
