# EP01 — Gestão de Usuários e Autenticação

> **Documento autoral de QA — planejamento original.** Conteúdo convertido do arquivo `Plano e Estratégia de Testes - MisterioBox - Gestão de Usuários e Autenticação.docx`
> sem resumir, combinar ou reescrever condições de teste. O cabeçalho e o rodapé do modelo de
> documento (material de curso) não foram reproduzidos. A ISO/IEC/IEEE 29119-3 foi usada como **base metodológica**; este documento não declara conformidade integral com a norma.
>
> Este é o **planejamento original** (novembro de 2026). O comportamento atual da aplicação e a
> cobertura automatizada atual estão em [Regras de negócio](Regras-de-Negocio-e-Criterios-de-Aceitacao),
> [Testes automatizados](Testes-Automatizados-e-Ferramentas) e
> [Rastreabilidade acadêmica](QA-Rastreabilidade-Academica).
>
> Documento próprio do Épico 01, elaborado antes do plano completo. O Épico 01 também aparece no
> [Plano e Estratégia de Testes — Completo](QA-Plano-e-Estrategia-de-Testes-Completo).

---

**Plano e Estratégia**

**de Testes**

Baseado na ISO-29119-3.

**1. Épico e Estimativa Geral de Esforço em Testes**

_Épico 01 — Gestão de Usuários e Autenticação_

- Permitir que jogadores se cadastrem, realizem login e acessem suas investigações com segurança.

_Funcionalidades:_ cadastro, login, logout e identificação do jogador autenticado.

Estimativa: Média

**2. User Stories e Estimativa de Esforço em Testes**

| Código | Descrição                           | Esforço - Horas |
| ------ | ----------------------------------- | --------------- |
| US01   | Cadastrar-se como detetive          | 1,5 h           |
| US02   | Autenticar-se na plataforma         | 1,5 h           |
| US03   | Encerrar sessão e proteger o acesso | 1,5h            |

**3. Condições de Teste e Camadas**

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

| ID        | Condição                                                                                 | Resultado Esperado                                                        | Camada              |
| --------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------- |
| US02-CT01 | Validar que o sistema autentica o jogador quando as credenciais forem válidas            | Ver a página secreta / retorno Status Code 200                            | Interface e API     |
| US02-CT02 | Validar o impedimento de autenticação com credenciais incorretas                         | Autenticação não realizada / Mensagem de erro amigável                    | Interface e API     |
| US02-CT03 | Validar a identificação do jogador autenticado e apresentar seu nome                     | Autenticação realizada / Nome visível, legível                            | Interface e API\*\* |
| US02-CT04 | Validar que o jogador consegue acessar o catálogo e seus próprios dados de investigação. | Exibição do catálogo e dados de investigação da própria conta             | Interface e API\*\* |
| US02-CT05 | Validar que um jogador autenticado não acesso os registro de outro jogador               | Mensagem amigável de bloqueio\*\*/ Exibição apenas dos próprios registros | Interface e API\*\* |

_Código da US: US03 Encerrar sessão e proteger o acesso_

| ID          | Condição                                                                                                          | Resultado Esperado                                         | Camada          |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------- |
| US03 - CT01 | Validar que é exibida a opção sair ao jogador autenticado                                                         | Opção sair, visível e legível                              | Interface       |
| US03 - CT02 | Validar que o jogador não consegue acessar páginas protegidas sem uma nova autenticação.                          | Mensagem informativa amigável / Não ver a página protegida | Interface e API |
| US03 - CT03 | Validar que o logout encerra ou abandonar uma investigação.                                                       | A investigação deve estar em andamento\*\*                 | Interface e API |
| US03 - CT04 | Validar que ao autenticar-se novamente, o jogador consegue recuperar seu progresso enquanto o banco estiver ativo | Visualizar progresso correto resgatado da sessão anterior  | Interface e API |
| US03 - CT05 | Validar que requisições protegidas sem autenticação válida são rejeitadas pela API.                               | Sem acesso as requisições / Mensagem informativa amigável  | Interface e API |

**4. Missões de Teste Exploratório**

- Missão 1 – Validação de cadastro,
- Missão 2 – Validação de login
- Missão 3 – Validação de logout
- Missão 4 – Validação de identificação do jogador autenticado.

**5. Testes Não-Funcionais**

Definir aqui.

| Tipo                            | Teste                                                                                                | Resultado Esperado                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Usabilidade                     | Validar a facilidade de uso<br>Validar que o site é intuitivo                                        | Site seja fácil de usar<br>Site seja claro como utilizar                           |
| (Responsividade?)               | Validar que o site se adapta aos tamanhos e formatos de tela e dispositivos de forma automática      | Site acompanhar os tamanhos de telas e dispositivos sem quebrar textos e elementos |
| Portabilidade / Compatibilidade | Validar que o site renderiza e faz suas funções de forma eficiente em outros browsers ou navegadores | Site renderizar corretamente                                                       |

**6. Automação de Testes**

| ID          | Condição                                                                                 | Resultado Esperado                                         | Camada          |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------- |
| US01-CT01   | Validar permissão de cadastro informando nome, e-mail e senha                            | Cadastro com sucesso / Status code 201                     | Interface e API |
| US01-CT04   | Validar o impedimento de cadastro com dados inválidos: nome, e-mail e senha              | Cadastro não realizado / Mensagem de erro amigável         | Interface e API |
| US02-CT01   | Validar que o sistema autentica o jogador quando as credenciais forem válidas            | Ver a página secreta / retorno Status Code 200             | Interface e API |
| US03 - CT02 | Validar que o jogador não consegue acessar páginas protegidas sem uma nova autenticação. | Mensagem informativa amigável / Não ver a página protegida | Interface e API |
