# Implantação da MistérioBox (Vercel + MongoDB Atlas)

Guia para publicar a MistérioBox com banco persistente. **Nada aqui é executado automaticamente:**
cada passo marcado com 👤 depende de uma ação da responsável pelo projeto (contas, segredos e
publicação).

## 1. Arquitetura

```
Navegador ──► Vercel (mesmo domínio)
               ├── /                 → SPA React (frontend/dist, arquivos estáticos)
               ├── /api/*            → Função Node.js api/index.ts → app Express (backend/src)
               └── /api-docs/*       → mesma função (Swagger UI)
                                         │
                                         ▼
                                  MongoDB Atlas (persistente)
```

- **Mesmo domínio:** o frontend chama `/api` (padrão de `VITE_API_BASE_URL`); não há CORS entre
  frontend e API em produção.
- **Função única:** `api/index.ts` cria o app Express uma vez por instância e, na primeira
  requisição, conecta ao Atlas e executa a carga idempotente do catálogo
  (`backend/src/database/ready.ts`). Requisições simultâneas na mesma instância compartilham a
  conexão (Fluid compute).
- **Banco por ambiente:**

  | Ambiente                              | Banco                                | Usuários demonstrativos | JWT_SECRET                  |
  | ------------------------------------- | ------------------------------------ | ----------------------- | --------------------------- |
  | Desenvolvimento local (`npm run dev`) | em memória (padrão) ou `MONGODB_URI` | sim (padrão)            | opcional                    |
  | Testes (Vitest, Playwright, CI)       | em memória                           | conforme o teste        | valores exclusivos de teste |
  | Vercel — Preview                      | Atlas (banco separado, recomendado)  | **nunca**               | obrigatório (≥ 32)          |
  | Vercel — Production                   | Atlas                                | **nunca**               | obrigatório (≥ 32)          |

  Em qualquer implantação na Vercel (`VERCEL=1`) ou com `NODE_ENV=production`, a API **não
  inicia** sem `MONGODB_URI` e `JWT_SECRET` válidos, recusa `SEED_DEMO_USERS=true` e nunca usa o
  banco em memória. A mensagem de erro lista apenas os nomes das variáveis, nunca os valores.

## 2. Configuração do MongoDB Atlas 👤

1. Criar uma conta no MongoDB Atlas e um **cluster** (o plano gratuito M0 atende à demonstração).
2. Em **Database Access**, criar um usuário de banco **exclusivo para a aplicação**, com senha
   gerada aleatoriamente e permissão **readWrite** somente no banco `misteriobox`
   (e `misteriobox-preview`, se usar prévias).
3. Em **Network Access**, liberar o acesso da Vercel. As funções da Vercel não têm IP fixo no
   plano gratuito; a opção usual é `0.0.0.0/0`, compensada por usuário com senha forte e
   permissão mínima. (Com IPs fixos — recurso pago da Vercel — restrinja à lista de IPs.)
4. Em **Connect → Drivers**, copiar a URI `mongodb+srv://...`, substituir usuário e senha e
   guardá-la apenas no gerenciador de senhas e nas variáveis da Vercel.
5. (Opcional) Pré-carregar o catálogo a partir da sua máquina, sem gravar a URI em arquivo:
   ```bash
   MONGODB_URI="<uri do Atlas>" npm run seed -w backend
   ```
   A carga é idempotente: insere as missões que faltam e atualiza as existentes, sem apagar
   missões, jogadores ou investigações. Se não for executada, a primeira requisição na Vercel
   faz a mesma carga.

Índices: a API cria somente os índices que faltam (`createIndexes`), sem remover índices nem
dados. Entre eles, o índice único parcial que garante uma única investigação em andamento por
jogador e missão.

## 3. Configuração do projeto na Vercel 👤

1. **Add New → Project** e importar o repositório `RoxaneNayara/misteriobox` (o repositório pode
   continuar **privado**; a Vercel pede permissão de leitura via GitHub App).
2. **Root Directory:** a raiz do repositório. O `vercel.json` já define:
   - `installCommand`: `MONGOMS_DISABLE_POSTINSTALL=1 npm ci` (não baixa o binário do MongoDB de
     testes durante o build);
   - `buildCommand`: `npm run build -w frontend`;
   - `outputDirectory`: `frontend/dist`;
   - função `api/index.ts` com `includeFiles: docs/openapi.yaml` e `maxDuration: 30`;
   - reescritas: `/api/*` e `/api-docs/*` para a função; demais caminhos para `index.html` (SPA).
3. **Node.js Version** (Settings → Build and Deployment): **24.x** (mesma versão do CI).
4. **Environment Variables:** preencher conforme a seção 4 — separadamente para **Production** e
   **Preview**.
5. **Deployment Protection:** manter as prévias protegidas (padrão) até a aprovação.
6. Fazer o primeiro deploy pela própria Vercel, a partir da `main`, **somente após aprovação**.

## 4. Checklist de variáveis de ambiente

| Variável                       | Production            | Preview                    | Local                   | Observação                                                                |
| ------------------------------ | --------------------- | -------------------------- | ----------------------- | ------------------------------------------------------------------------- |
| `MONGODB_URI`                  | ✅ obrigatória        | ✅ obrigatória             | opcional                | URI do Atlas. Nunca no repositório.                                       |
| `MONGODB_DB_NAME`              | `misteriobox`         | `misteriobox-preview`      | `misteriobox`           | Separa dados de prévia e produção.                                        |
| `JWT_SECRET`                   | ✅ obrigatória        | ✅ obrigatória (diferente) | opcional                | `openssl rand -hex 32`. Não reutilize os valores de teste do repositório. |
| `JWT_EXPIRES_IN_SECONDS`       | `28800`               | `28800`                    | `28800`                 | Limite absoluto da sessão (8 h).                                          |
| `SESSION_IDLE_TIMEOUT_SECONDS` | `1800`                | `1800`                     | `1800`                  | Inatividade (30 min), regra do B04.                                       |
| `BCRYPT_SALT_ROUNDS`           | `10`                  | `10`                       | `10`                    | Custo do hash de senha.                                                   |
| `CORS_ORIGIN`                  | (não necessário)      | (não necessário)           | `http://localhost:5173` | Mesmo domínio na Vercel.                                                  |
| `SEED_DEMO_USERS`              | não definir           | não definir                | `true` (padrão)         | `true` é recusado em produção.                                            |
| `DEMO_USER_*_PASSWORD`         | não definir           | não definir                | opcional                | Somente local.                                                            |
| `MONGOMS_DISABLE_POSTINSTALL`  | (já no `vercel.json`) | —                          | —                       | Evita download do MongoDB de testes.                                      |

Variáveis definidas automaticamente pela Vercel e usadas pela API: `VERCEL` (identifica a
implantação) e `NODE_ENV`.

## 5. Smoke tests pós-deploy

Executar a partir da sua máquina (Node 20+), contra a URL publicada:

```bash
npm run smoke -- https://<seu-projeto>.vercel.app
```

Somente leitura (seguro em produção): saúde da API; catálogo com 10 missões (3/3/4) sem campos
da solução; `Cache-Control: no-store`; rota autenticada recusada sem token (401); 404 em JSON;
`/`, `/login` e `/historico` entregando o aplicativo.

Fluxo completo, que **cria um jogador de teste** com e-mail e senha aleatórios (não exibidos):

```bash
npm run smoke -- https://<seu-projeto>.vercel.app --write
```

Verifica cadastro, login, sessão, início de investigação, análise de evidência com progresso
salvo, continuidade (409 apontando a tentativa em andamento), histórico, renovação da sessão e
abandono da tentativa de teste. Prefira rodar o modo `--write` na prévia.

> Prévias protegidas pela Vercel (Deployment Protection) respondem com a tela de autenticação da
> Vercel a requisições externas; nesse caso, rode o smoke test na URL de produção ou gere um
> _Protection Bypass for Automation_ nas configurações do projeto.

**Verificação manual complementar (navegador):**

- [ ] Cadastro, login e logout (Sair) — logout em uma aba encerra as outras.
- [ ] Catálogo com os três setores e "Em breve".
- [ ] Iniciar, sair e continuar uma investigação; dica e evidência com notificação temporária.
- [ ] Acusação, relatório, "Jogar novamente" e histórico com as duas tentativas.
- [ ] **Persistência após reinicialização:** fazer um novo deploy (Redeploy) e confirmar que o
      jogador, o progresso e o histórico continuam disponíveis.
- [ ] `/api-docs` abre a documentação (se não abrir, ver seção 7).
- [ ] Logs da função (Vercel → Logs) sem URI do banco, senhas ou tokens.

## 6. Rollback

- **Código:** na Vercel, _Deployments_ → escolher a implantação anterior estável →
  **Instant Rollback** (ou _Promote to Production_). Não exige novo build.
- **Configuração:** alterações de variáveis só valem após novo deploy; para desfazer, restaurar
  o valor anterior e reimplantar (ou usar o rollback acima).
- **Banco:** a carga do catálogo não apaga nem recria dados, e a aplicação não executa migrações
  destrutivas. Um rollback de código não exige ação no banco. Para proteção adicional, ativar
  backups/snapshots no Atlas (disponíveis nos planos pagos) ou exportar periodicamente com
  `mongodump`.
- **Emergência:** pausar o projeto na Vercel (Settings → _Pause Project_) ou revogar o usuário do
  banco no Atlas.

## 7. Pontos a validar no primeiro deploy

Itens que dependem do ambiente real da Vercel e não puderam ser verificados localmente:

1. **Reescrita `/api/*` → `api/index`:** confirmar pelo smoke test que as rotas da API respondem
   com o caminho original (ex.: `/api/missions`).
2. **Swagger UI (`/api-docs`):** depende de o pacote da função incluir os arquivos estáticos do
   `swagger-ui-dist`. Se falhar, a API continua funcionando; apenas a documentação fica
   indisponível (`/api-docs/openapi.json` usa somente `docs/openapi.yaml`).
3. **Tempo de partida a frio:** a primeira requisição de uma instância conecta ao Atlas e
   executa a carga do catálogo (alguns segundos).

## 8. Segurança — verificações antes da publicação

- [x] Nenhuma credencial real no repositório nem no histórico do Git (varredura de padrões de
      URI com senha, chaves privadas e tokens; somente valores de teste e marcadores).
- [x] Arquivos `.env` ignorados pelo Git; apenas `.env.example` versionado, sem valores.
- [x] Rotas de investigações, histórico, sessão e renovação exigem token (testes de integração e
      smoke test).
- [x] Produção recusa iniciar sem `MONGODB_URI`/`JWT_SECRET` válidos e nunca cria usuários
      demonstrativos nem exibe senhas temporárias.
- [x] Logs de conexão mostram apenas host e nome do banco; falhas de banco na função registram
      só o tipo do erro; erros internos respondem com mensagem genérica (sem pilha).
- [x] Respostas da API com `Cache-Control: no-store`.
- [ ] 👤 Segredos criados e guardados somente na Vercel e no gerenciador de senhas.
- [ ] 👤 Usuário do Atlas com permissão mínima e senha forte.

## 9. Ações que dependem da responsável pelo projeto 👤

1. Criar o cluster, o usuário e a liberação de rede no MongoDB Atlas (seção 2).
2. Gerar o `JWT_SECRET` de produção (e outro para prévias).
3. Criar o projeto na Vercel, conceder acesso ao repositório e cadastrar as variáveis (seções 3 e 4).
4. Aprovar o merge deste PR na `main`.
5. Autorizar e disparar o primeiro deploy.
6. Executar o smoke test (seção 5) e a verificação manual.
7. Decidir sobre domínio próprio, se desejado.
