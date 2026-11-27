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

Os valores secretos (senhas e URIs) ficam **somente** no Atlas, no seu gerenciador de senhas e nas
variáveis da Vercel — nunca em arquivos do repositório, em mensagens ou em capturas de tela.

### 2.1 Projeto e cluster

1. Criar uma organização e um **projeto** (ex.: `misteriobox`).
2. Criar um cluster **M0 (gratuito)**. O M0 atende à demonstração, mas tem limitações: sem backups
   automáticos e com recursos compartilhados.
3. **Região:** escolher a mesma região (ou a mais próxima) da função da Vercel, porque cada
   requisição da API consulta o banco. Duas combinações coerentes:
   - **São Paulo:** Atlas em AWS `sa-east-1` (se disponível para o M0) + Vercel `gru1`;
   - **EUA (padrão da Vercel):** Atlas em AWS `us-east-1` (N. Virginia) + Vercel `iad1`.

### 2.2 Usuários do banco — permissão mínima, um por ambiente

Em **Database Access → Add New Database User**:

| Usuário                   | Autenticação                             | Privilégio                                          | Uso                 |
| ------------------------- | ---------------------------------------- | --------------------------------------------------- | ------------------- |
| `misteriobox-app-prod`    | senha gerada pelo Atlas (_Autogenerate_) | **readWrite** apenas no banco `misteriobox`         | Vercel — Production |
| `misteriobox-app-preview` | senha gerada pelo Atlas                  | **readWrite** apenas no banco `misteriobox-preview` | Vercel — Preview    |

- Em **Database User Privileges**, usar _Specific Privileges_ → `readWrite` com o nome do banco
  (sem coleção). **Não** usar `readWriteAnyDatabase`, `atlasAdmin` nem `dbAdmin`.
  `readWrite` já permite criar as coleções e os índices de que a API precisa.
- Se disponível, marcar _Restrict Access to Specific Clusters_ e selecionar só este cluster.
- Usuários separados garantem que uma prévia **não consiga** ler nem alterar os dados de
  produção, mesmo que alguma variável seja preenchida errado.
- Não reutilize a senha da sua conta do Atlas e não crie usuários com o seu nome pessoal.

### 2.3 Acesso de rede

As funções da Vercel **não têm IP fixo** nos planos Hobby e Pro sem o recurso pago de IPs
estáticos. Por isso, para a Vercel alcançar o Atlas, a lista de acesso precisa de `0.0.0.0/0`.
Essa abertura é compensada por:

- usuários com senha forte gerada pelo Atlas e permissão restrita a um único banco (2.2);
- conexão sempre criptografada (TLS) pela URI `mongodb+srv://`;
- nenhum usuário administrativo usado pela aplicação;
- troca das senhas ao menor sinal de exposição (Database Access → Edit → Edit Password) e
  atualização da variável na Vercel.

Se no futuro o projeto tiver IPs estáticos na Vercel (ou outra hospedagem com IP fixo), substitua
`0.0.0.0/0` pela lista de IPs. Para executar a carga do catálogo a partir da sua máquina
(seção 2.5), basta a liberação já existente; se preferir, adicione temporariamente só o seu IP
(_Add Current IP Address_) e remova-o depois.

### 2.4 URI de conexão

Em **Connect → Drivers**, copiar a URI `mongodb+srv://...` do cluster e substituir usuário e senha
pelos do ambiente correspondente. Não é preciso colocar o nome do banco na URI: ele vem de
`MONGODB_DB_NAME`. Guarde as duas URIs (produção e prévia) no gerenciador de senhas.

### 2.5 Carga do catálogo (opcional)

Para pré-carregar as 10 missões a partir da sua máquina, sem gravar a URI em arquivo (o espaço
inicial evita que o comando fique no histórico do terminal em zsh/bash configurados para isso):

```bash
 MONGODB_URI="<uri de produção>" MONGODB_DB_NAME=misteriobox npm run seed -w backend
```

A carga é idempotente (seção 2.6). Se não for executada, a primeira requisição na Vercel faz a
mesma carga.

### 2.6 Atualização do catálogo e investigações em andamento

A cada inicialização, a API faz _upsert_ das missões por `missionId`:

- **preserva** o registro e a identidade de cada missão (mesmo `_id` e `missionId`), os jogadores
  e todas as investigações; nada é apagado ou recriado;
- **atualiza** o conteúdo das missões existentes (textos, evidências, dicas e solução) para o que
  está no código publicado.

**Risco:** uma investigação em andamento guarda os identificadores das evidências analisadas e das
dicas usadas, e é pontuada com a solução vigente no momento da acusação. Se uma missão publicada
tiver evidências, dicas, pré-requisitos ou a solução **removidos, renomeados ou trocados**, quem
estiver no meio do caso pode ver progresso inconsistente ou ser pontuado com uma solução diferente
da que investigou.

**Regras adotadas:**

- Correções de **texto** (ortografia, clareza) podem ser publicadas a qualquer momento.
- Mudanças **estruturais** em missão publicada não devem ser feitas: crie uma **nova missão**
  (novo `missionId`).
- O teste `backend/tests/unit/published-catalog.test.ts` congela os identificadores de
  suspeitos, evidências, pré-requisitos, dicas, culpado e evidência decisiva das 10 missões e
  falha na CI se algum deles mudar. Alterar a referência
  (`backend/tests/unit/fixtures/catalogo-publicado.json`) exige uma decisão consciente e a
  avaliação das investigações em andamento no banco.

Índices: a API cria somente os índices que faltam (`createIndexes`), sem remover índices nem
dados. Entre eles, o índice único parcial que garante uma única investigação em andamento por
jogador e missão. Se duas instâncias carregarem o catálogo ao mesmo tempo, a segunda tentativa
apenas atualiza o que a primeira inseriu.

## 3. Configuração do projeto na Vercel 👤

1. **Add New → Project** e importar o repositório `RoxaneNayara/misteriobox`. O repositório pode
   continuar **privado**: a Vercel pede, pelo GitHub App, acesso somente aos repositórios escolhidos.
2. **Framework Preset:** _Other_. **Root Directory:** a raiz do repositório. O `vercel.json` já
   define:
   - `installCommand`: `MONGOMS_DISABLE_POSTINSTALL=1 npm ci` (não baixa o binário do MongoDB de
     testes durante o build);
   - `buildCommand`: `npm run build -w frontend`;
   - `outputDirectory`: `frontend/dist`;
   - função `api/index.ts` com `includeFiles: docs/openapi.yaml` e `maxDuration: 30`;
   - reescritas (seção 3.1).
3. **Node.js Version** (Settings → Build and Deployment): **24.x** (mesma versão do CI).
4. **Function Region** (Settings → Functions): a mesma região do Atlas (seção 2.1).
5. **Environment Variables:** cadastrar conforme a seção 4, **marcando o ambiente de cada valor**
   (Production ou Preview — nunca os dois para `MONGODB_URI`, `MONGODB_DB_NAME` e `JWT_SECRET`).
   Marcar os segredos como **Sensitive**, para que não possam ser lidos depois na interface.
6. **Deployment Protection:** manter as prévias protegidas (padrão) até a aprovação.
7. Fazer o primeiro deploy pela própria Vercel, a partir da `main`, **somente após aprovação**.

### 3.1 Reescritas (`vercel.json`)

| Ordem | Origem                             | Destino       | Motivo                                                      |
| ----- | ---------------------------------- | ------------- | ----------------------------------------------------------- |
| 1     | `/api`                             | `/api/index`  | rota da API sem barra final                                 |
| 2     | `/api/(.*)`                        | `/api/index`  | todas as rotas da API na mesma função Express               |
| 3     | `/api-docs` e `/api-docs/(.*)`     | `/api/index`  | documentação (Swagger UI)                                   |
| 4     | `/((?!api/\|api-docs\|assets/).*)` | `/index.html` | rotas do SPA (`/login`, `/historico`, `/investigacoes/...`) |

- Arquivos estáticos existentes (ex.: `/assets/*.js`, imagens) têm precedência sobre as
  reescritas e são servidos diretamente.
- `/assets/` fica fora do fallback do SPA: um arquivo inexistente (ex.: de uma versão anterior)
  responde **404** em vez de devolver a página HTML com status 200.

### 3.2 Isolamento de dados entre Preview e Production

Os jogadores, o progresso e o histórico de produção nunca podem ser lidos ou alterados por uma
prévia. A proteção tem três camadas:

1. **Variáveis por ambiente na Vercel:** `MONGODB_URI`, `MONGODB_DB_NAME` e `JWT_SECRET` com
   valores diferentes em Production e em Preview.
2. **Usuários do Atlas por ambiente (seção 2.2):** o usuário de prévia só tem acesso ao banco
   `misteriobox-preview`; o de produção, só a `misteriobox`. Uma URI trocada por engano é
   recusada pelo próprio banco.
3. **Verificação na inicialização da API** (`backend/src/config/env.ts`): na Vercel,
   `MONGODB_DB_NAME` é obrigatória; em **Preview** o nome precisa indicar prévia (ex.:
   `misteriobox-preview`); em **Production**, um nome de prévia é recusado. Coberto por
   `backend/tests/unit/env.test.ts`.

Com `JWT_SECRET` diferentes, um token emitido numa prévia também não vale em produção.

## 4. Checklist de variáveis de ambiente

| Variável                       | Production            | Preview                    | Local                   | Observação                                                                |
| ------------------------------ | --------------------- | -------------------------- | ----------------------- | ------------------------------------------------------------------------- |
| `MONGODB_URI`                  | ✅ usuário `-prod`    | ✅ usuário `-preview`      | opcional                | URI do Atlas, com o usuário do ambiente (2.2). Nunca no repositório.      |
| `MONGODB_DB_NAME`              | ✅ `misteriobox`      | ✅ `misteriobox-preview`   | `misteriobox`           | Obrigatória na Vercel; Preview precisa conter `preview` e Production não. |
| `JWT_SECRET`                   | ✅ obrigatória        | ✅ obrigatória (diferente) | opcional                | `openssl rand -hex 32`. Não reutilize os valores de teste do repositório. |
| `JWT_EXPIRES_IN_SECONDS`       | `28800`               | `28800`                    | `28800`                 | Limite absoluto da sessão (8 h).                                          |
| `SESSION_IDLE_TIMEOUT_SECONDS` | `1800`                | `1800`                     | `1800`                  | Inatividade (30 min), regra do B04.                                       |
| `BCRYPT_SALT_ROUNDS`           | `10`                  | `10`                       | `10`                    | Custo do hash de senha.                                                   |
| `CORS_ORIGIN`                  | (não necessário)      | (não necessário)           | `http://localhost:5173` | Mesmo domínio na Vercel.                                                  |
| `SEED_DEMO_USERS`              | não definir           | não definir                | `true` (padrão)         | `true` é recusado em produção.                                            |
| `DEMO_USER_*_PASSWORD`         | não definir           | não definir                | opcional                | Somente local.                                                            |
| `MONGOMS_DISABLE_POSTINSTALL`  | (já no `vercel.json`) | —                          | —                       | Evita download do MongoDB de testes.                                      |

Variáveis definidas automaticamente pela Vercel e usadas pela API: `VERCEL` (identifica a
implantação), `VERCEL_ENV` (`production` ou `preview`, usada no isolamento da seção 3.2) e
`NODE_ENV`.

## 5. Smoke tests pós-deploy

Executar a partir da sua máquina (Node 20+), contra a URL publicada:

```bash
npm run smoke -- https://<seu-projeto>.vercel.app
```

Somente leitura (seguro em produção): saúde da API; catálogo com 10 missões (3/3/4) sem campos
da solução; `Cache-Control: no-store`; rota autenticada recusada sem token (401); 404 em JSON; reescrita
preservando o caminho original; e, como aviso (não reprova), arquivo inexistente em `/assets` com 404;
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

### 5.1 Diagnóstico de 503 "Banco de dados indisponível"

Quando a preparação do banco falha, a função responde **503 `SERVICE_UNAVAILABLE`** e registra
nos logs da Vercel (_Deployments_ → implantação → _Logs_) uma linha só com metadados seguros —
nunca a mensagem do driver, a URI, o usuário ou a senha:

```
[api] Banco de dados indisponível: {"phase":"indices","name":"MongoServerError","code":13,"codeName":"Unauthorized","category":"permissao"}
```

| `phase` / `category`                         | Causa provável                                                                                                      | O que conferir (sem expor a senha)                                                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `conexao` / `autenticacao` (código 8000, 18) | Usuário ou senha recusados                                                                                          | Nome do usuário na URI igual ao do Atlas (_Database Access_); senha atual (se trocada, atualizar `MONGODB_URI` e reimplantar); a URI não deve ter `authSource` diferente de `admin`. |
| `indices` / `permissao` (código 13)          | Conexão aceita, mas o usuário não tem `readWrite` no banco usado. Em geral `MONGODB_DB_NAME` ≠ banco do privilégio. | `MONGODB_DB_NAME` exatamente igual ao banco do privilégio `readWrite` (ex.: `misteriobox` ↔ `readWrite@misteriobox`), sem espaços, maiúsculas diferentes ou sufixos como `-prod`.    |
| `conexao` / `rede`                           | Cluster inacessível (Network Access, cluster pausado)                                                               | _Network Access_ com a entrada ativa; cluster não pausado.                                                                                                                           |
| `conexao` / `uri-invalida`                   | `MONGODB_URI` mal formada                                                                                           | Formato `mongodb+srv://<usuário>:<senha>@<host>/?retryWrites=true&w=majority`; sem aspas ou espaços copiados junto.                                                                  |
| `carga-inicial`                              | Falha ao gravar o catálogo                                                                                          | Mesmo critério de permissão acima; se persistir, abrir Issue com a linha do log.                                                                                                     |

Variáveis alteradas na Vercel só valem após **novo deploy** (_Redeploy_).

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

Comportamentos que dependem do ambiente real da Vercel e **não puderam ser comprovados
localmente**. Validar primeiro numa **prévia** (banco `misteriobox-preview`):

| #   | Comportamento                                                                | Como verificar                                                                                                                                                      | Se falhar                                                                   |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | A reescrita `/api/*` → `api/index` entrega ao Express o **caminho original** | smoke test: "GET /api/health … preserva o caminho original"                                                                                                         | o teste indica a causa; revisar as reescritas antes de promover             |
| 2   | Fallback do SPA com exclusão de `/assets/` (expressão com _lookahead_)       | smoke test: `/`, `/login`, `/historico` em HTML; `/assets/…` inexistente em 404 (verificação de **aviso** ⚠ — localmente, o `vite preview` sempre devolve a página) | simplificar a origem do fallback para `/(.*)` (perde só o 404 de `/assets`) |
| 3   | Inclusão de `docs/openapi.yaml` no pacote da função                          | `/api-docs/openapi.json` responde 200                                                                                                                               | só a documentação fica indisponível (503); a API segue                      |
| 4   | Swagger UI (`/api-docs`) com os arquivos do `swagger-ui-dist`                | abrir `/api-docs` no navegador                                                                                                                                      | a API segue; documentação via `openapi.json`                                |
| 5   | Conexão com o Atlas a partir da região da função e liberação de rede         | smoke test com `--write`; logs da função sem erro de conexão                                                                                                        | revisar Network Access e o usuário (seção 2)                                |
| 6   | Partida a frio (conexão + carga do catálogo) dentro de `maxDuration`         | primeira requisição após um deploy; logs da função                                                                                                                  | aumentar `maxDuration` ou pré-carregar o catálogo (2.5)                     |
| 7   | Isolamento Preview × Production                                              | logs mostram o banco conectado (`[database] … /misteriobox-preview`)                                                                                                | a API recusa iniciar com nome de banco incompatível (3.2)                   |

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

## 10. Registro da configuração utilizada

Preenchido durante a configuração assistida, **somente com valores não secretos**. Senhas, URIs
completas e o `JWT_SECRET` nunca são registrados aqui.

| Item                                  | Valor utilizado                                                | Data |
| ------------------------------------- | -------------------------------------------------------------- | ---- |
| Projeto do Atlas                      | _a preencher_                                                  |      |
| Cluster (nome / plano)                | _a preencher_ / M0                                             |      |
| Provedor e região do Atlas            | _a preencher_                                                  |      |
| Usuário do banco — Production         | `misteriobox-app-prod` (readWrite em `misteriobox`)            |      |
| Usuário do banco — Preview            | `misteriobox-app-preview` (readWrite em `misteriobox-preview`) |      |
| Network Access                        | _a preencher_                                                  |      |
| Projeto da Vercel                     | _a preencher_                                                  |      |
| Node.js                               | 24.x                                                           |      |
| Região da função (Vercel)             | _a preencher_                                                  |      |
| Variáveis cadastradas — Production    | _a preencher (somente nomes)_                                  |      |
| Variáveis cadastradas — Preview       | _a preencher (somente nomes)_                                  |      |
| Deployment Protection (prévias)       | _a preencher_                                                  |      |
| Primeiro deploy (prévia) e smoke test | _a preencher_                                                  |      |
