# Segurança e privacidade

[← Início](Home) · Anterior: [Gestão de defeitos](Gestao-de-Defeitos-Riscos-e-Rastreabilidade) ·
Próxima: [Execução local e contribuição](Execucao-Local-e-Contribuicao)

> Esta página descreve os controles **implementados** no código atual e separa claramente as
> **limitações** e as **melhorias planejadas**. A MistérioBox é um projeto acadêmico: não foi feita
> uma avaliação formal de conformidade com a LGPD, e esta página não declara conformidade.

## Dados pessoais tratados

| Dado                           | Onde fica                        | Finalidade                            | Proteção atual                                                                                                   |
| ------------------------------ | -------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Nome                           | Coleção `users`                  | Exibição na credencial e no cabeçalho | Validação estrita; exibido como texto (sem HTML)                                                                 |
| E-mail                         | Coleção `users` (índice único)   | Login e unicidade da conta            | Normalizado; não é enviado a outros jogadores, não entra no token e não é registrado nos logs de erro publicados |
| Senha                          | Coleção `users` (`passwordHash`) | Autenticação                          | **Hash** bcrypt com sal; a senha não é armazenada nem é recuperável; o campo não é lido por padrão               |
| Tentativas de investigação     | Coleção `investigations`         | Progresso, histórico e relatórios     | Ligadas ao jogador só pelo identificador interno (`userId`), não por nome ou e-mail                              |
| Token de sessão                | `localStorage` do navegador      | Manter a sessão                       | JWT assinado (HS256) com o `userId`, sem nome ou e-mail; expira por inatividade (30 min) e no máximo em 8 h      |
| Datas de criação e atualização | `users` e `investigations`       | Histórico e auditoria funcional       | —                                                                                                                |

### Termos usados nesta página

| Termo               | Significado aqui                                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Hash**            | Transformação de mão única (bcrypt) usada para senhas: verifica-se a senha, mas não se recupera o valor original.                                                                          |
| **Criptografia**    | Transformação reversível com chave. Segundo a documentação do MongoDB Atlas, o armazenamento é criptografado e as conexões exigem TLS; a aplicação não criptografa campos individualmente. |
| **Pseudonimização** | Substituir a identidade direta por um identificador (o `userId` nas investigações). Ainda é dado pessoal: a ligação pode ser refeita pela coleção `users`.                                 |
| **Anonimização**    | Remover de forma irreversível a possibilidade de identificar a pessoa. A aplicação **não** produz hoje estatísticas anonimizadas.                                                          |

## Controle de acesso

- Rotas de investigação e histórico exigem token válido (`401` sem autenticação ou com sessão
  expirada).
- Cada investigação só é lida ou alterada pelo próprio jogador: qualquer ação sobre a investigação
  de outro jogador recebe `403` e não altera nada. O histórico usa apenas o jogador do token; o
  endpoint não aceita identificador de usuário.
- A solução de uma missão só sai da API quando a regra de revelação permite (RN08); evidências
  bloqueadas não são enviadas ao navegador (RN03).
- Entradas estritas: campos extras, objetos e operadores do MongoDB são recusados (`400`), e corpos
  fora de `application/json` recebem `415`.
- Depois do login, o site só redireciona para caminhos internos (endereços externos e caminhos com
  barra invertida são recusados).

## Separação de ambientes

| Ambiente            | Banco                           | Garantia no código                                                                                       |
| ------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Production (Vercel) | Atlas, banco de produção        | `MONGODB_URI`, `MONGODB_DB_NAME` e `JWT_SECRET` (≥ 32 caracteres) obrigatórios; banco de prévia recusado |
| Preview (Vercel)    | Atlas, banco de prévia separado | Só aceita banco cujo nome indique prévia; sem configuração, a API não inicia                             |
| Local, testes e CI  | MongoDB em memória (padrão)     | Dados descartados ao reiniciar; segredos e senhas exclusivos de teste                                    |

Usuários demonstrativos nunca são criados em ambiente publicado. No Atlas, cada ambiente tem um
usuário de banco próprio, com permissão `readWrite` somente no banco do ambiente.

## Logs

- Falhas de preparação do banco na função da Vercel registram só etapa, tipo e código do erro.
- Em ambiente publicado, erros inesperados registram só tipo e código; mensagens que poderiam conter
  dados enviados pelo jogador (como o e-mail) não vão para os logs. Localmente, o erro completo
  continua disponível para depuração.
- Senhas demonstrativas nunca são geradas nem exibidas: sem a variável de senha configurada, o
  usuário demonstrativo simplesmente não é criado.
- A configuração é validada na inicialização sem exibir valores de variáveis.

## Dependências

A auditoria com `npm audit` de **27/11/2026** encontrou avisos em `zod` (alta), `react-router`
(moderada), `vitest`/`tinypool` (crítica, só desenvolvimento), `@vitest/mocker` (moderada, só
desenvolvimento) e `glob`/`minimatch` usados pelo `mocha` (moderada, só desenvolvimento). Todos
foram tratados em mudanças próprias, com testes de regressão:

| Pacote                            | Antes                    | Depois                            |
| --------------------------------- | ------------------------ | --------------------------------- |
| `zod`                             | 3.25.76                  | 4.6.7                             |
| `react-router-dom`                | 6.30.6                   | 7.18.7                            |
| `vitest`                          | 3.2.7 (`tinypool` 1.1.1) | 4.1.12 (sem `tinypool`)           |
| `glob` / `minimatch` (no `mocha`) | 13.0.7 / 10.2.6          | 14.0.6 / 11.0.9 (via `overrides`) |

Depois dessas mudanças, `npm audit` informou **0 vulnerabilidades conhecidas** (27/11/2026). Esse
resultado vale para a data da verificação: novos avisos podem surgir, e a auditoria deve ser
repetida periodicamente.

## Boas práticas implementadas

- Senhas com bcrypt e limite de 72 bytes, sem truncamento silencioso.
- Sessão com expiração por inatividade e limite absoluto; renovação sem estender o limite.
- `Cache-Control: no-store` nas respostas da API.
- `.env` e arquivos de credenciais ignorados pelo Git; CI sem segredos e com permissão somente de
  leitura do repositório.
- Testes automatizados para validação de entrada, sessão, isolamento entre jogadores, isolamento de
  ambientes, logs seguros e revelação da solução.

## Limitações conhecidas

| Limitação                                                                   | Impacto                                                                     |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Acesso de rede do Atlas liberado para qualquer IP (`0.0.0.0/0`)             | Proteção depende das credenciais do usuário do banco e do TLS               |
| Logout sem revogação do token no servidor                                   | Um token copiado vale até expirar (no máximo 30 min sem renovação)          |
| Sem limite de tentativas de login ou cadastro                               | Tentativas repetidas de senha não são bloqueadas                            |
| Cadastro informa quando um e-mail já existe (`409`)                         | Permite descobrir se um e-mail tem conta                                    |
| `403` para investigação existente de outro jogador e `404` para inexistente | Permite inferir que um identificador existe (nenhum dado é exposto)         |
| Sem exclusão de conta pelo jogador nem política de retenção automatizada    | A exclusão depende de ação manual no banco                                  |
| Token guardado em `localStorage`                                            | Um script malicioso na página poderia lê-lo; não há Content Security Policy |
| Plano gratuito do Atlas sem backup automático                               | Perda de dados em incidente                                                 |

## Melhorias planejadas

Estas melhorias **ainda não estão implementadas**:

- Exclusão de conta pelo próprio jogador, com remoção das tentativas associadas, e política de
  retenção documentada.
- Limite de tentativas de login e cadastro; resposta genérica no cadastro.
- Cabeçalhos de segurança (incluindo Content Security Policy) no site e na API.
- Estatísticas agregadas sem identificação de jogadores, se forem criadas estatísticas globais.
- Restrição de rede do Atlas a endereços fixos, caso a hospedagem passe a oferecê-los.
- Auditoria de dependências automatizada (por exemplo, alertas do GitHub) no repositório público.
