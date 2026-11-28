# Épico 02 — Catálogo e Seleção de Missões (recorte de navegação)

> **Recorte de navegação do [Plano e Estratégia de Testes — Completo](QA-Plano-e-Estrategia-de-Testes-Completo).**
> O Plano e Estratégia de Testes da MistérioBox é **um único documento**, organizado em quatro
> épicos. Esta página não é um documento separado: reúne, sem alterações, os trechos do Épico 02
> que aparecem nas seções do plano completo. Para a leitura integral e as seções que não são
> divididas por épico, consulte o documento completo.

---

**1. Épico e Estimativa Geral de Esforço em Testes**

_**Épico 02 — Catálogo e Seleção de Missões**_

- Permitir que o jogador conheça os casos disponíveis, compreenda seus níveis de dificuldade e selecione a investigação que deseja iniciar ou continuar.

_Funcionalidades:_ catálogo, sinopse, níveis fácil/médio/difícil, status e início de missão.

Estimativa: Média

_Regra de Negócio Relacionada:_

- _RN02 — Níveis de dificuldade das missões._

**2. User Stories e Estimativa de Esforço em Testes**

_**Épico 02 — Catálogo e Seleção de Missões**_

| Código | Descrição                                      | Esforço - Horas |
| ------ | ---------------------------------------------- | --------------- |
| US04   | Consultar o catálogo de missões                | 1,5 h           |
| US05   | Visualizar detalhes e dificuldades das missões | 1,5 h           |
| US06   | Selecionar e acessar uma investigação          | 1,5h            |

**3. Condições de Teste e Camadas**

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

**5. Missões de Teste Exploratório**

_**Épico 02 — Catálogo e Seleção de Missões**_

- Missão 1 – Validação de catálogo, validação de sinopse, validação de níveis de dificuldade e status, validação de início da missão
  - relatorio\_de\_sessao\_US02\_US03\_US04\_autenticar\_encerrar\_sessao\_consultar\_catálogo
  - relatorio\_de\_sessao\_US02\_US03\_US04\_autenticar\_encerrar\_sessao\_consultar\_catálogo
