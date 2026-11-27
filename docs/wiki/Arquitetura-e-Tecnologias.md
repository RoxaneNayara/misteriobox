# Arquitetura e tecnologias

[← Início](Home) · Anterior: [Funcionalidades](Funcionalidades-e-Fluxo-do-Jogador) · Próxima:
[Regras de negócio](Regras-de-Negocio-e-Criterios-de-Aceitacao)

## Visão geral

```
                 Production / Preview (Vercel)                         Local
┌───────────────────────────────┐                    ┌──────────────────────────────────┐
│ Site estático (frontend/dist) │                    │ Vite (5173) ──proxy /api──► API   │
│   /api/* e /api-docs/*  ──────┼──► Função          │                       (3333)      │
│                               │    api/index.ts    │                         │         │
└───────────────────────────────┘        │           │              MongoDB em memória   │
                                         ▼           └──────────────────────────────────┘
                                  MongoDB Atlas
                       (bancos separados por ambiente)
```

- **Monorepo com npm workspaces:** `backend/` e `frontend/` são projetos independentes,
  orquestrados pelo `package.json` da raiz.
- **API independente:** o frontend consome somente a API real, sem dados simulados. Todas as regras
  de negócio são executadas no backend; o frontend repete algumas validações apenas para avisar
  antes do envio.
- **Respostas padronizadas:** sucesso `{ "data": ... }`; erro
  `{ "error": { "code", "message", "details"? } }`, com tratamento centralizado e
  `Cache-Control: no-store`.

## Backend em camadas

| Camada        | Pasta                       | Responsabilidade                                    |
| ------------- | --------------------------- | --------------------------------------------------- |
| Rotas         | `backend/src/routes/`       | Endereços da API e do Swagger                       |
| Controladores | `backend/src/controllers/`  | Camada HTTP, sem regra de negócio                   |
| Serviços      | `backend/src/services/`     | Regras RN01–RN08, pontuação e sessão                |
| Repositórios  | `backend/src/repositories/` | Acesso a dados                                      |
| Modelos       | `backend/src/models/`       | Schemas Mongoose e índices                          |
| Validadores   | `backend/src/validators/`   | Schemas Zod das entradas                            |
| Middlewares   | `backend/src/middlewares/`  | Autenticação, `Content-Type`, validação e erros     |
| Mappers       | `backend/src/mappers/`      | Montam as respostas e ocultam dados secretos        |
| Banco         | `backend/src/database/`     | Conexão, preparação e carga idempotente do catálogo |

## Tecnologias

| Camada          | Tecnologias                                                            |
| --------------- | ---------------------------------------------------------------------- |
| Frontend        | React 18, TypeScript, Vite 6, React Router 7, CSS responsivo           |
| Backend         | Node.js, Express 5, TypeScript, Zod 4, JSON Web Token, bcryptjs        |
| Banco de dados  | Mongoose 8; MongoDB Atlas (publicado) ou MongoDB Memory Server (local) |
| Documentação    | OpenAPI 3 + Swagger UI                                                 |
| Qualidade       | ESLint 9 (typescript-eslint, react-hooks, jsx-a11y), Prettier 3        |
| Testes          | Vitest 4, Supertest, Playwright, Mocha e Chai                          |
| CI e publicação | GitHub Actions; Vercel                                                 |

## Decisões de segurança

- **Solução protegida:** o culpado, a evidência decisiva e a explicação não são selecionados por
  padrão no Mongoose e só entram na resposta quando a regra de revelação permite (RN08).
- **Evidências bloqueadas:** o conteúdo não é enviado ao frontend antes do desbloqueio (RN03).
- **Entradas estritas:** objetos, operadores do MongoDB (`{"$gt": ""}`) e campos extras são
  recusados com `400`; corpos que não são `application/json` recebem `415`.
- **Senhas:** hash bcrypt, limite de 72 bytes sem truncamento silencioso.
- **Configuração por ambiente:**
  `config/env.ts`
  exige `MONGODB_URI` e um `JWT_SECRET` de pelo menos 32 caracteres quando publicado, recusa
  usuários demonstrativos e impede que Preview use o banco de Production (e vice-versa).
- **Logs seguros:** falhas de banco na função da Vercel e erros inesperados em ambiente publicado
  registram só etapa, tipo e código do erro, nunca a mensagem, a URI, credenciais ou dados enviados
  pelo jogador. Senhas demonstrativas nunca são exibidas.
- **Redirecionamento seguro:** depois do login, o site só navega para caminhos internos.

## Contrato da API

O contrato completo está em
`docs/openapi.yaml` e
pode ser explorado no Swagger UI (`/api-docs`). Exemplo de resposta `422` ao tentar analisar uma
evidência bloqueada:

```json
{
  "error": {
    "code": "EVIDENCE_LOCKED",
    "message": "Esta evidência está bloqueada. Analise primeiro as evidências exigidas.",
    "details": { "missingRequirements": ["<id da evidência exigida>"] }
  }
}
```

Principais códigos: `400` dados inválidos, `401` sem autenticação ou sessão expirada, `403`
investigação de outro jogador, `404` inexistente, `409` estado incompatível, `415` tipo de conteúdo
não suportado, `422` regra de negócio violada, `503` banco indisponível.
