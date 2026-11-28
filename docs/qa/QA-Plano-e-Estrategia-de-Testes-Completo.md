# Plano e Estratégia de Testes — Completo

> **Documento autoral de QA — planejamento original.** Conteúdo convertido do arquivo `plano_e_estrategia_de_testes_misteriobox.docx`
> sem resumir, combinar ou reescrever condições de teste. O cabeçalho e o rodapé do modelo de
> documento (material de curso) não foram reproduzidos. A ISO/IEC/IEEE 29119-3 foi usada como **base metodológica**; este documento não declara conformidade integral com a norma.
>
> Este é o **planejamento original** (novembro de 2026). O comportamento atual da aplicação e a
> cobertura automatizada atual estão em [Regras de negócio](Regras-de-Negocio-e-Criterios-de-Aceitacao),
> [Testes automatizados](Testes-Automatizados-e-Ferramentas) e
> [Rastreabilidade acadêmica](QA-Rastreabilidade-Academica).

---

**Plano e Estratégia**

**de Testes**

Baseado na ISO-29119-3.

**1. Épico e Estimativa Geral de Esforço em Testes**

_**Épico 01 — Gestão de Usuários e Autenticação**_

- Permitir que jogadores se cadastrem, realizem login e acessem suas investigações com segurança.

_Funcionalidades:_ cadastro, login, logout e identificação do jogador autenticado.

Estimativa: Alta

_Regra de Negócio Relacionada:_

- _RN01 — Autenticação de usuários._

_**Épico 02 — Catálogo e Seleção de Missões**_

- Permitir que o jogador conheça os casos disponíveis, compreenda seus níveis de dificuldade e selecione a investigação que deseja iniciar ou continuar.

_Funcionalidades:_ catálogo, sinopse, níveis fácil/médio/difícil, status e início de missão.

Estimativa: Média

_Regra de Negócio Relacionada:_

- _RN02 — Níveis de dificuldade das missões._

_**Épico 03 — Gerenciamento das Investigações**_

- Permitir que o jogador investigue casos, analise evidências, acompanhe seu progresso e gerencie suas tentativas, preservando o histórico individual.

_Funcionalidades:_ Início de investigação, consulta de suspeitos, análise e desbloqueio de evidências, utilização de dicas, salvamento automático, retomada, abandono, histórico e novas tentativas.

Estimativa: Alta

_Regra de Negócio Relacionada:_

- _RN03 — Desbloqueio de evidências_
- _RN06 — Salvamento e retomada_
- _RN07 — Abandono_
- _RN08 — Finalização e novas tentativas_

_**Épico 04 — Resolução, Pontuação e Classificação**_

- Permitir que o jogador conclua sua investigação, apresente uma acusação definitiva e receba um resultado com pontuação, classificação e explicação do mistério.

_Funcionalidades:_ Acusação, validação das condições para acusar, encerramento por acusação, cálculo da pontuação, classificação do detetive e relatório final.

Estimativa: Alta

_Regra de Negócio Relacionada:_

- _RN04 — Acusação._
- _RN05 — Pontuação e classificação._
- _RN08 — Bloqueio de ações após a finalização e revelação da solução._
- _RN01 — Controle de acesso individual, como requisito transversal._

**2. User Stories e Estimativa de Esforço em Testes**

_**Épico 01 — Gestão de Usuários e Autenticação**_

| Código | Descrição                           | Esforço - Horas |
| ------ | ----------------------------------- | --------------- |
| US01   | Cadastrar-se como detetive          | 4,0 h           |
| US02   | Autenticar-se na plataforma         | 3,0 h           |
| US03   | Encerrar sessão e proteger o acesso | 2,0 h           |

_**Épico 02 — Catálogo e Seleção de Missões**_

| Código | Descrição                                      | Esforço - Horas |
| ------ | ---------------------------------------------- | --------------- |
| US04   | Consultar o catálogo de missões                | 1,5 h           |
| US05   | Visualizar detalhes e dificuldades das missões | 1,5 h           |
| US06   | Selecionar e acessar uma investigação          | 1,5h            |

_**Épico 03 — Catálogo e Seleção de Missões**_

| Código | Descrição                                      | Esforço - Horas |
| ------ | ---------------------------------------------- | --------------- |
| US07   | Iniciar e retomar uma investigação             | 2,0 h           |
| US08   | Analisar evidências e consultar dicas          | 3,0 h           |
| US09   | Abandonar uma investigação                     | 1,5 h           |
| US010  | Consultar histórico e iniciar novas tentativas | 1,5 h           |

_**Épico 04 — Catálogo e Seleção de Missões**_

| Código | Descrição                                   | Esforço - Horas |
| ------ | ------------------------------------------- | --------------- |
| US11   | Apresentar uma acusação definitiva          | 1,5 h           |
| US12   | Receber pontuação e classificação           | 1,0 h           |
| US13   | Consultar o relatório final da investigação | 1,0 h           |

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

_**Épico 02 — Catálogo e Seleção de Missões**_

_Código da US: US04 -_ _**Consultar o catálogo de missões**_

| ID        | Condição                                                                                                                                  | Resultado Esperado                                                                                 | Camada                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------- |
| US04-CT01 | Validar que o sistema apresenta as três missões disponíveis no catálogo: O Último Aplauso, O Quarto 307 e A Carta de Novembro             | Exibição de todas as três missões disponíveis / Status code 200                                    | Interface e API                  |
| US04-CT02 | Validar que cada missão apresenta título, sinopse resumida, dificuldade e status da investigação do jogador.                              | Exibição de forma clara título, sinopse resumida, dificuldade e status da investigação do jogador. | Interface e API                  |
| US04-CT03 | Validar que as informações apresentadas são obtidas da API, sem utilização de dados estáticos que simulem os casos.                       | Conexão entre API e Interface estejam sincronizando dados corretamente.                            | Integração entre Interface e API |
| US04-CT04 | Validar que catálogo apresenta informações coerentes com o estado atual das investigações do jogador autenticado                          | Catalogo apresente o estado atual de investigação do jogador.                                      | Interface e API                  |
| US04-CT05 | Validar que: quando a consulta das missões falhar, a interface informe o problema sem apresentar dados incorretos como se fossem válidos. | Exibição da mensagem de missão indisponível, sem dados fictícios carregados.                       | Interface e API\*\*              |

_Código da US: US05_ _**Visualizar detalhes e dificuldades das missões**_

| ID        | Condição                                                                                                                       | Resultado Esperado                                                                             | Camada          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------- |
| US05-CT01 | Validar que cada missão possui um dos níveis de dificuldade previstos: fácil, médio ou difícil.                                | Exibição dos níveis de dificuldade de forma clara em cada missão.                              | Interface e API |
| US05-CT02 | Validar que a dificuldade será apresentada com identificação textual, independentemente de cores ou elementos visuais.         | Exibição a dificuldade em forma de texto.                                                      | Interface e API |
| US05-CT03 | Validar que o jogador consiga consultar a sinopse completa antes de iniciar uma investigação.                                  | Exibição da opção de consultar sinopse legível completa                                        | Interface       |
| US05-CT04 | Validar que o catálogo apresenta as quantidades de suspeitos, evidências e dicas previstas para cada caso.                     | Exibição da quantidades de suspeitos, evidências e dicas previstas para cada caso              | Interface e API |
| US05-CT05 | Validar que a visualização de informações públicas da missão não revele o suspeito culpado, a evidência decisiva ou a solução. | As informações publicas não devem exibir: suspeito culpado, a evidência decisiva ou a solução. | Interface       |

_Código da US: US06_ _**Selecionar e acessar uma investigação**_

| ID          | Condição                                                                                                                                                                             | Resultado Esperado                                                                                                                                          | Camada              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| US06 - CT01 | Validar que o jogador deve conseguir selecionar uma missão existente no catálogo.                                                                                                    | Opção de **Iniciar a investigação**, disponível                                                                                                             | Interface e API\*\* |
| US06 - CT02 | Validar que a seleção direcione o jogador ao fluxo correspondente à situação atual daquela missão.                                                                                   | Exibir a tela sequencial da missão                                                                                                                          | Interface           |
| US06 - CT03 | Validar que quando não existir tentativa ativa e houver tentativas encerradas, o jogador visualize a ação Jogar novamente.                                                           | Opção de **Jogar novamente**, disponível                                                                                                                    | Interface e API\*\* |
| US06 - CT04 | Validar que quando existir uma investigação em andamento, o jogador visualize a ação Continuar investigação, acessando a tentativa existente.                                        | Opção de **Continuar a investigação**, disponível                                                                                                           | Interface e API\*\* |
| US06- CT05  | Validar que ao jogar novamente, o sistema crie uma nova tentativa, sem modificar o histórico anterior, iniciando sem evidências analisadas, dicas utilizadas ou acusação registrada. | Exibir o histórico com a nova tentativa registrada sem evidências analisadas, dicas utilizadas ou acusação registrada e sem modificar o histórico existente | Interface e API     |

_**Épico 03 — Gerenciamento das Investigações**_

_Código da US: US07 -_ _**Iniciar e retomar uma investigação**_

| ID        | Condição                                                                                                                                               | Resultado Esperado                                                                                                            | Camada                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| US07-CT01 | Validar que ao iniciar uma missão sem tentativa ativa, o sistema crie uma investigação vinculada ao jogador autenticado, com status **Em Andamento**   | Exibição do status **Em Andamento**/ Status code 200                                                                          | Interface e API                  |
| US07-CT02 | Validar que a investigação inicia sem evidências analisadas, dicas utilizadas ou acusação registrada.                                                  | Exibição da investigação sem evidências analisadas, dicas utilizadas ou acusação registrada.                                  | Interface e API\*\*\*            |
| US07-CT03 | Validar que o sistema salva automaticamente o progresso após cada ação confirmada pela API.                                                            | Progresso salvo no banco e interface gráfica.                                                                                 | Integração entre Interface e API |
| US07-CT04 | Validar que ao retornar à investigação em andamento, o jogador encontre as evidências analisadas, dicas utilizadas e estado anteriormente registrados. | Progresso com evidências analisadas, dicas utilizadas e estado anteriormente registrados, salvo no banco e interface gráfica. | Integração entre Interface e API |
| US07-CT05 | Validar que o logout não encerra nem abandona a investigação, e o progresso permanece disponível enquanto o banco em memória estiver ativo.            | Ao voltar a aplicação após logout, o progresso esteja disponível enquanto o banco estiver ativo.                              | Interface e API\*\*              |

_Código da US: US08_ _**Analisar evidências e consultar dicas**_

| ID        | Condição                                                                                                                                                                       | Resultado Esperado                                                                                                          | Camada                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| US08-CT01 | Validar que o sistema permite a consulta dos suspeitos e das evidências disponíveis na investigação.                                                                           | Exibição opções de consulta dos suspeitos e das evidências disponíveis.                                                     | Interface e API\*\*\* |
| US08-CT02 | Validar que as evidências sem pré-requisitos pendentes devem poder ser analisadas pelo jogador.                                                                                | Consultar uma dica disponível.                                                                                              | Interface e API       |
| US08-CT03 | Validar que as evidências dependentes devem permanecer bloqueadas até que todas as evidências exigidas tenham sido analisadas.                                                 | Desbloquear evidência após cumprir pré-requisitos                                                                           | Interface             |
| US08-CT04 | Validar que ao analisar uma evidência válida, o sistema registre a ação e atualizar o progresso da investigação, sem contabilizar novamente uma evidência já analisada.        | Exibição de progresso da investigação, sem contabilização de evidencia analisada.                                           | Interface e API       |
| US08-CT05 | Validar que o jogador consiga consultar as dicas previstas para a missão, respeitando a disponibilidade definida para cada caso e sem contabilizar repetidamente a mesma dica. | Possibilidade do jogador consultar dicas previstas, disponíveis pra cada caso, sem contabilizar repetidamente a mesma dica. | Interface             |

_Código da US: US09_ _**Abandonar uma investigação**_

| ID          | Condição                                                                                                               | Resultado Esperado                                                                 | Camada          |
| ----------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------- |
| US09 - CT01 | Validar que o sistema deve disponibilizar a opção de abandono somente para investigações em andamento.                 | Abandonar uma investigação só é possível com ela em andamento.                     | Interface e API |
| US09 - CT02 | Validar que antes da confirmação, o sistema informe que a tentativa será encerrada e não poderá ser retomada.          | Exibir mensagem amigável e legível.                                                | Interface       |
| US09 - CT03 | Validar que ao cancelar a confirmação, a investigação permanece em andamento, sem alterações no progresso.             | Ao cancelar a confirmação, a investigação não sofre alterações.                    | Interface       |
| US09 - CT04 | Validar que ao confirmar o abandono, a tentativa deve receber o status **Abandonado**, sem pontuação ou classificação. | Status **Abandonado** deve ficar visível, sem pontuação ou classificação.          | Interface e API |
| US09- CT05  | Validar que uma tentativa abandonada não permite novas ações investigativas e não deve revelar a solução do caso.      | Impedimento de alterações em tentativa abandonada. Não revelar o desfecho do caso. | Interface e API |

_Código da US: US10_ _**Consultar histórico e iniciar novas tentativas**_

| ID          | Condição                                                                                                                                                                                  | Resultado Esperado                                                                               | Camada          |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------- |
| US10 - CT01 | Validar que o sistema deve apresentar o histórico de tentativas pertencentes ao jogador autenticado, ordenado da mais recente para a mais antiga.                                         | Exibição de histórico ordenando por tentativa recente apenas do jogador autenticado.             | Interface e API |
| US10 - CT02 | Validar que cada registro identifique missão, número da tentativa, dificuldade, datas, status, evidências e dicas utilizadas, além de pontuação e classificação quando aplicáveis.        | Dados do registro devem estar disponíveis no histórico.                                          | Interface e API |
| US10 - CT03 | Validar que o sistema diferencie investigações sem pontuação de investigações concluídas com zero pontos e apresentar um estado vazio quando não houver histórico.                        | Consulta de investigações sem pontuação, investigação concluída sem pontuação e histórico vazio. | Interface e API |
| US10 - CT04 | Validar que uma missão encerrada recebe uma nova tentativa, que deve começar sem evidências analisadas, dicas utilizadas ou acusação, preservando integralmente as tentativas anteriores. | Missões encerradas podem receber nova tentativa, sem dados registrados.                          | Interface e API |
| US10- CT05  | Validar que o sistema impeça mais de uma tentativa em andamento por jogador e missão, inclusive diante de solicitações simultâneas.                                                       | Impedimento de mais de uma tentativa simultânea.                                                 | Interface e API |

_**Épico 04 — Resolução, Pontuação e Classificação**_

_Código da US: US11 -_ _**Apresentar uma acusação definitiva**_

| ID        | Condição                                                                                                                                                                              | Resultado Esperado                                                                                                                                                         | Camada          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| US11-CT01 | Validar que o sistema permite uma acusação definitiva somente quando o jogador tiver analisado pelo menos três evidências na investigação em andamento.                               | Permissão de acusação válida.                                                                                                                                              | Interface e API |
| US11-CT02 | Validar que a acusação contenha um suspeito pertencente à missão e uma evidência previamente analisada pelo jogador.                                                                  | Impedir acusação sem uma evidencia previamente analisada e um suspeito pertencente a missão.                                                                               | Interface e API |
| US11-CT03 | Validar que o sistema impeça acusações com informações ausentes, inválidas ou que não pertençam à investigação.                                                                       | Impedir acusação sem evidências suficientes, inválidas ou de fora da investigação.                                                                                         | Interface e API |
| US11-CT04 | Validar que antes do envio definitivo, o sistema solicite confirmação ao jogador, informando que a decisão encerrará a tentativa e não poderá ser alterada.                           | Exibição de modal com informação e opção de confirmar ou não.                                                                                                              | Interface       |
| US11-CT05 | Validar que após confirmar uma acusação válida, a investigação é encerrada como **Solucionado** ou **Não Solucionado** conforme o suspeito escolhido, impedindo uma segunda acusação. | Exibir Solucionado ou Não Solucionado após confirmação de uma acusação válida. A investigação é encerrada conforme o suspeito escolhido, sem possibilidade de novas ações. | Interface e API |

_Código da US: US12_ _**Receber pontuação e classificação**_

| ID        | Condição                                                                                                                                                | Resultado Esperado                                                                    | Camada          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------- |
| US12-CT01 | Validar que o sistema atribua 70 pontos quando o suspeito escolhido estiver correto; caso contrário, não deve conceder esses pontos.                    | Pontuação 70, suspeito correto. Suspeito incorreto, não deve pontuar.                 | Interface e API |
| US12-CT02 | Validar que o sistema conceda conceder 30 pontos adicionais pela evidência decisiva correta somente quando o suspeito escolhido também estiver correto. | Pontuação 30 adicionais, evidencia decisiva correta e suspeito escolhido correto.     | Interface e API |
| US12-CT03 | Validar que cada dica utilizada desconte 10 pontos, respeitando a pontuação mínima de zero e máxima de 100.                                             | Cada dica utilizada desconta 10 pontos. Pontuação mínima de zero e máxima 100.        | Interface e API |
| US12-CT04 | Validar que a classificação corresponda à faixa de pontuação definida na **RN05.**                                                                      | Classificação esteja em acordo com a **RN05.**                                        | Interface e API |
| US12-CT05 | Validar que a pontuação e classificação é calculada no backend e registradas na tentativa finalizada, sem aceitar valores determinados pelo frontend.   | Calculo não seja exibido o frontend. Registro no banco, sem aceitar valores externos. | Interface e API |

_Código da US: US013_ _**Consultar o relatório final da investigação**_

| ID          | Condição                                                                                                                                                                   | Resultado Esperado                                                                                           | Camada          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------- |
| US13 - CT01 | Validar que após uma acusação definitiva, o sistema disponibiliza o relatório final da tentativa encerrada.                                                                | Relatório disponível após a acusação definitiva.                                                             | Interface e API |
| US13 - CT02 | Validar que o relatório apresente a missão, o suspeito escolhido, o resultado da acusação, a pontuação e a classificação do detetive.                                      | O Relatório deve conter as informações da investigação.                                                      | Interface e API |
| US13 - CT03 | Validar que o relatório revele a solução correta e sua explicação somente quando a tentativa tiver sido encerrada por acusação.                                            | O relatório revela a solução correta e sua explicação após o encerramento por acusação.                      | Interface e API |
| US13 - CT04 | Validar que o jogador consiga consultar novamente os relatórios de suas tentativas anteriores sem modificar os resultados registrados.                                     | Consultar relatório de uma tentativa anterior sem altera-las.                                                | Interface e API |
| US13- CT05  | Validar que o sistema impeça a exposição da solução de investigações em andamento ou abandonadas e restringir o acesso aos relatórios pertencentes ao jogador autenticado. | Impedimento de exposição da solução em andamento ou abandonada. Impedir acesso ao relatório de outro jogador | Interface e API |

**4. Técnicas de Teste**

- **Técnicas com base em Regras de negócio**
  - Análise do Valor Limite
  - Partição de Equivalência
- **Testes exploratórios**
  - Heurísticas de teste VADER e (heurísticas de testes Test Obsessed, Test Heuristics Cheat Sheet Heuristics & Frameworks, com ideias de Elisabeth Hendrickson, James Lyndsay, and Dale Emery.)
  - Testes Exploratórios Ad-Hocs

**5. Missões de Teste Exploratório**

_**Épico 01 — Gestão de Usuários e Autenticação**_

- Missão 1 – Validação de cadastro, login, logout e de identificação do jogador autenticado.
  - relatorio \_de\_sessao\_US01\_cadastrar\_se\_como\_detetive

_**Épico 02 — Catálogo e Seleção de Missões**_

- Missão 1 – Validação de catálogo, validação de sinopse, validação de níveis de dificuldade e status, validação de início da missão
  - relatorio\_de\_sessao\_US02\_US03\_US04\_autenticar\_encerrar\_sessao\_consultar\_catálogo
  - relatorio\_de\_sessao\_US02\_US03\_US04\_autenticar\_encerrar\_sessao\_consultar\_catálogo

_**Épico 03 — Catálogo e Seleção de Missões**_

- N/A

_**Épico 04 — Catálogo e Seleção de Missões**_

- N/A

_**ISO25010**_

- Missão 1 – Validação de Responsividade, Usabilidade e Compatilbilidade
  - relatorio\_de\_sessao\_ISO25010\_responsividade\_usabilidade\_e\_compatibilidade

**6. Testes Não-Funcionais**

| Tipo                            | Teste                                                                                                | Resultado Esperado                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Usabilidade                     | Validar a facilidade de uso<br>Validar que o site é intuitivo                                        | Site seja fácil de usar<br>Site seja claro como utilizar                           |
| (Responsividade?)               | Validar que o site se adapta aos tamanhos e formatos de tela e dispositivos de forma automática      | Site acompanhar os tamanhos de telas e dispositivos sem quebrar textos e elementos |
| Portabilidade / Compatibilidade | Validar que o site renderiza e faz suas funções de forma eficiente em outros browsers ou navegadores | Site renderizar corretamente                                                       |

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
