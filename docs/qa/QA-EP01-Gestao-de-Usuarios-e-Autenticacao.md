# Épico 01 — Gestão de Usuários e Autenticação (recorte de navegação)

> **Recorte de navegação do [Plano e Estratégia de Testes — Completo](QA-Plano-e-Estrategia-de-Testes-Completo).**
> O Plano e Estratégia de Testes da MistérioBox é **um único documento**, organizado em quatro
> épicos. Esta página não é um documento separado: reúne, sem alterações, os trechos do Épico 01
> que aparecem nas seções do plano completo. Para a leitura integral e as seções que não são
> divididas por épico, consulte o documento completo.

---

**1. Épico e Estimativa Geral de Esforço em Testes**

_**Épico 01 — Gestão de Usuários e Autenticação**_

- Permitir que jogadores se cadastrem, realizem login e acessem suas investigações com segurança.

_Funcionalidades:_ cadastro, login, logout e identificação do jogador autenticado.

Estimativa: Alta

_Regra de Negócio Relacionada:_

- _RN01 — Autenticação de usuários._

**2. User Stories e Estimativa de Esforço em Testes**

_**Épico 01 — Gestão de Usuários e Autenticação**_

| Código | Descrição                           | Esforço - Horas |
| ------ | ----------------------------------- | --------------- |
| US01   | Cadastrar-se como detetive          | 4,0 h           |
| US02   | Autenticar-se na plataforma         | 3,0 h           |
| US03   | Encerrar sessão e proteger o acesso | 2,0 h           |

**3. Condições de Teste e Camadas**

_**Épico 01 — Gestão de Usuários e Autenticação**_

_Código da US: US01 - Cadastrar-se como detetive_

| ID        | Condição                                                                               | Resultado Esperado                                          | Camada                          |
| --------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------- |
| US01-CT01 | Validar permissão de cadastro informando nome, e-mail e senha                          | Cadastro com sucesso / Status code 201                      | Interface e API                 |
| US01-CT02 | Validar que criação de jogador crie um identificador único                             | Número de ID gerado                                         | Interface, API e banco de dados |
| US01-CT03 | Validar o impedimento de cadastro de e-mail já utilizado                               | Cadastro não realizado / Mensagem de erro amigável          | Interface e API                 |
| US01-CT04 | Validar o impedimento de cadastro com dados inválidos: nome, e-mail e senha            | Cadastro não realizado / Mensagem de erro amigável          | Interface e API                 |
| US01-CT05 | Validar estouro de campos em todos os campos do formulário                             | Cadastro não realizado / Mensagem de erro amigável          | Interface e API                 |
| US01-CT06 | Validar que campos obrigatórios ausentes sejam rejeitados com feedbacks compreensíveis | Cadastro não realizado / Mensagem de erro amigável          | Interface e API                 |
| US01-CT07 | Validar que a senha não fica armazenada em texto puro e nem retornada na API           | Anonimização de dados armazenados / Retorno anonimizado\*\* | API e Banco de Dados            |

_Código da US: US02 Autenticar-se na plataforma_

| ID        | Condição                                                                                 | Resultado Esperado                                                        | Camada          |
| --------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------- |
| US02-CT01 | Validar que o sistema autentica o jogador quando as credenciais forem válidas            | Ver a página secreta / retorno Status Code 200                            | Interface e API |
| US02-CT02 | Validar o impedimento de autenticação com credenciais incorretas                         | Autenticação não realizada / Mensagem de erro amigável                    | Interface e API |
| US02-CT03 | Validar a identificação do jogador autenticado e apresentar seu nome                     | Autenticação realizada / Nome visível, legível                            | Interface e API |
| US02-CT04 | Validar que o jogador consegue acessar o catálogo e seus próprios dados de investigação. | Exibição do catálogo e dados de investigação da própria conta             | Interface e API |
| US02-CT05 | Validar que um jogador autenticado não acesso os registro de outro jogador               | Mensagem amigável de bloqueio\*\*/ Exibição apenas dos próprios registros | Interface e API |

_Código da US: US03 Encerrar sessão e proteger o acesso_

| ID          | Condição                                                                                                          | Resultado Esperado                                         | Camada          |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------- |
| US03 - CT01 | Validar que é exibida a opção sair ao jogador autenticado                                                         | Opção sair, visível e legível                              | Interface       |
| US03 - CT02 | Validar que o jogador não consegue acessar páginas protegidas sem uma nova autenticação.                          | Mensagem informativa amigável / Não ver a página protegida | Interface e API |
| US03 - CT03 | Validar que o logout não encerra ou abandonar uma investigação.                                                   | A investigação deve estar em andamento\*\*                 | Interface e API |
| US03 - CT04 | Validar que ao autenticar-se novamente, o jogador consegue recuperar seu progresso enquanto o banco estiver ativo | Visualizar progresso correto resgatado da sessão anterior  | Interface e API |
| US03 - CT05 | Validar que requisições protegidas sem autenticação válida são rejeitadas pela API.                               | Sem acesso as requisições / Mensagem informativa amigável  | API             |

**5. Missões de Teste Exploratório**

_**Épico 01 — Gestão de Usuários e Autenticação**_

- Missão 1 – Validação de cadastro, login, logout e de identificação do jogador autenticado.
  - relatorio \_de\_sessao\_US01\_cadastrar\_se\_como\_detetive

**7. Automação de Testes**

_**Épico 01 — Gestão de Usuários e Autenticação**_

| ID          | Condição                                                                                 | Resultado Esperado                                         | Camada          |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------- |
| US01-CT01   | Validar permissão de cadastro informando nome, e-mail e senha                            | Cadastro com sucesso / Status code 201                     | Interface e API |
| US01-CT04   | Validar o impedimento de cadastro com dados inválidos: nome, e-mail e senha              | Cadastro não realizado / Mensagem de erro amigável         | Interface e API |
| US02-CT01   | Validar que o sistema autentica o jogador quando as credenciais forem válidas            | Ver a página secreta / retorno Status Code 200             | Interface e API |
| US03 - CT02 | Validar que o jogador não consegue acessar páginas protegidas sem uma nova autenticação. | Mensagem informativa amigável / Não ver a página protegida | Interface e API |

_**Obs.: Poderão ser encontradas mais condições de testes futuramente e incrementadas nesse documento.**_

Não haverão cenários automatizados para os Épicos 02, 03 e 04 devido ao prazo de primeira entrega. Poderão ser feitos futuramente.
