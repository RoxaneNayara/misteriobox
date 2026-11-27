# Segurança e privacidade

[← Início](Home) · Anterior: [Gestão de defeitos](Gestao-de-Defeitos-Riscos-e-Rastreabilidade) ·
Próxima: [Execução local e contribuição](Execucao-Local-e-Contribuicao)

> Esta página descreve os controles **implementados** no código da branch `main` e separa
> claramente as **limitações** e as **melhorias planejadas**. A MistérioBox é um projeto acadêmico;
> não foi feita uma avaliação formal de conformidade com a LGPD, e esta página não declara
> conformidade.

## Dados pessoais tratados

| Dado                           | Onde fica                        | Finalidade                            | Proteção atual                                                                                              |
| ------------------------------ | -------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Nome                           | Coleção `users`                  | Exibição na credencial e no cabeçalho | Validação estrita; exibido como texto (sem HTML)                                                            |
| E-mail                         | Coleção `users` (índice único)   | Login e unicidade da conta            | Normalizado; não é enviado a outros jogadores nem incluído no token                                         |
| Senha                          | Coleção `users` (`passwordHash`) | Autenticação                          | **Hash** bcrypt com sal; a senha não é armazenada nem é recuperável                                         |
| Tentativas de investigação     | Coleção `investigations`         | Progresso, histórico e relatórios     | Ligadas ao jogador só pelo identificador interno (`userId`), não por nome ou e-mail                         |
| Token de sessão                | `localStorage` do navegador      | Manter a sessão                       | JWT assinado (HS256) com o `userId`, sem nome ou e-mail; expira por inatividade (30 min) e no máximo em 8 h |
| Datas de criação e atualização | `users` e `investigations`       | Histórico e auditoria funcional       | —                                                                                                           |

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
- Cada investigação só é lida ou alterada pelo próprio jogador (`403` para outro jogador). O
  histórico usa apenas o jogador do token; o endpoint não aceita identificador de usuário.
- A solução de uma missão só sai da API quando a regra de revelação permite (RN08); evidências
  bloqueadas não são enviadas ao navegador (RN03).
- Entradas estritas: campos extras, objetos e operadores do MongoDB são recusados (`400`), e corpos
  fora de `application/json` recebem `415`.

## Separação de ambientes

| Ambiente            | Banco                           | Garantia no código                                                                                       |
| ------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Production (Vercel) | Atlas, banco de produção        | `MONGODB_URI`, `MONGODB_DB_NAME` e `JWT_SECRET` (≥ 32 caracteres) obrigatórios; banco de prévia recusado |
| Preview (Vercel)    | Atlas, banco de prévia separado | Só aceita banco cujo nome indique prévia; sem configuração, a API não inicia                             |
| Local, testes e CI  | MongoDB em memória (padrão)     | Dados descartados ao reiniciar; segredos e senhas exclusivos de teste                                    |

Usuários demonstrativos nunca são criados em ambiente publicado. No Atlas, cada ambiente tem um
usuário de banco próprio, com permissão `readWrite` somente no banco do ambiente.

## Boas práticas implementadas

- Senhas com bcrypt e limite de 72 bytes, sem truncamento silencioso.
- Sessão com expiração por inatividade e limite absoluto; renovação sem estender o limite.
- `Cache-Control: no-store` nas respostas da API.
- Falhas de banco na função da Vercel registradas só com etapa, tipo e código do erro.
- Configuração validada na inicialização, sem exibir valores de variáveis.
- `.env` e arquivos de credenciais ignorados pelo Git; CI sem segredos e com permissão somente de
  leitura do repositório.
- Testes automatizados para validação de entrada, sessão, isolamento de ambientes e revelação da
  solução.

## Limitações conhecidas

| Limitação                                                                                          | Impacto                                                                                                                                           |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acesso de rede do Atlas liberado para qualquer IP (`0.0.0.0/0`)                                    | Proteção depende das credenciais do usuário do banco e do TLS                                                                                     |
| Logout sem revogação do token no servidor                                                          | Um token copiado vale até expirar (no máximo 30 min sem renovação)                                                                                |
| Sem limite de tentativas de login ou cadastro                                                      | Tentativas repetidas de senha não são bloqueadas                                                                                                  |
| Cadastro informa quando um e-mail já existe (`409`)                                                | Permite descobrir se um e-mail tem conta                                                                                                          |
| Sem exclusão de conta pelo jogador nem política de retenção automatizada                           | A exclusão depende de ação manual no banco                                                                                                        |
| Token guardado em `localStorage`                                                                   | Um script malicioso na página poderia lê-lo; não há Content Security Policy                                                                       |
| Plano gratuito do Atlas sem backup automático                                                      | Perda de dados em incidente                                                                                                                       |
| Erros inesperados registrados por completo nos logs da Vercel                                      | Mensagens do banco podem conter valores enviados (ex.: e-mail); correção em revisão no [#33](https://github.com/RoxaneNayara/misteriobox/pull/33) |
| No ambiente local, sem senhas demonstrativas configuradas, senhas temporárias aparecem no terminal | Exposição em capturas de tela; correção em revisão no [#33](https://github.com/RoxaneNayara/misteriobox/pull/33)                                  |

## Melhorias planejadas

Estas melhorias **ainda não estão implementadas**:

- Exclusão de conta pelo próprio jogador, com remoção das tentativas associadas, e política de
  retenção documentada.
- Limite de tentativas de login e cadastro.
- Cabeçalhos de segurança (incluindo Content Security Policy) no site e na API.
- Estatísticas agregadas sem identificação de jogadores, se forem criadas estatísticas globais.
- Restrição de rede do Atlas a endereços fixos, caso a hospedagem passe a oferecê-los.
