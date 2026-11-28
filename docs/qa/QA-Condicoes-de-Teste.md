# Condições de Teste

> **Documento autoral de QA — planejamento original.** Conteúdo convertido do arquivo `condicoes_de_testes_misteriobox.docx`
> sem resumir, combinar ou reescrever condições de teste. O cabeçalho e o rodapé do modelo de
> documento (material de curso) não foram reproduzidos. A ISO/IEC/IEEE 29119-3 foi usada como **base metodológica**; este documento não declara conformidade integral com a norma.
>
> Este é o **planejamento original** (novembro de 2026). O comportamento atual da aplicação e a
> cobertura automatizada atual estão em [Regras de negócio](Regras-de-Negocio-e-Criterios-de-Aceitacao),
> [Testes automatizados](Testes-Automatizados-e-Ferramentas) e
> [Rastreabilidade acadêmica](QA-Rastreabilidade-Academica).

---

**Condições de Teste**

Baseado na ISO-29119-3.

**Requisitos Testados:**

**RN01 — Acesso autenticado e isolamento das investigações**

Somente usuários autenticados podem iniciar investigações. Cada jogador pode acessar apenas suas próprias investigações e seus respectivos progressos.

Tentativas de acesso não autorizado devem ser bloqueadas pelo backend:

- **HTTP 401:** requisições sem autenticação válida.
- **HTTP 403:** tentativas de acesso à investigação de outro jogador.

O histórico deve considerar exclusivamente o jogador identificado pelo token de autenticação.

_**Épicos relacionados:**_ _EP01 e EP04, com aplicação transversal ao EP03._

_Código da US: US01 - Cadastrar-se como detetive_

| **ID**    | **Condição de Teste**                                                                  | **Prioridade** |
| --------- | -------------------------------------------------------------------------------------- | -------------- |
| US01-CT01 | Validar permissão de cadastro informando nome, e-mail e senha                          | Alta           |
| US01-CT02 | Validar que criação de jogador crie um identificador único                             | Alta           |
| US01-CT03 | Validar o impedimento de cadastro de e-mail já utilizado                               | Alta           |
| US01-CT04 | Validar o impedimento de cadastro com dados inválidos: nome, e-mail e senha            | Alta           |
| US01-CT05 | Validar estouro de campos em todos os campos do formulário                             | Média          |
| US01-CT06 | Validar que campos obrigatórios ausentes sejam rejeitados com feedbacks compreensíveis | Alta           |
| US01-CT07 | Validar que a senha não fica armazenada em texto puro e nem retornada na API           | Alta           |

_Código da US: US02 Autenticar-se na plataforma_

| **ID**    | **Condição de Teste**                                                                    | **Prioridade** |
| --------- | ---------------------------------------------------------------------------------------- | -------------- |
| US02-CT01 | Validar que o sistema autentica o jogador quando as credenciais forem válidas            | Alta           |
| US02-CT02 | Validar o impedimento de autenticação com credenciais incorretas                         | Alta           |
| US02-CT03 | Validar a identificação do jogador autenticado e apresentar seu nome                     | Alta           |
| US02-CT04 | Validar que o jogador consegue acessar o catálogo e seus próprios dados de investigação. | Alta           |
| US02-CT05 | Validar que um jogador autenticado não acessa os registro de outro jogador               | Média          |

_Código da US: US03 Encerrar sessão e proteger o acesso_

| **ID**     | **Condição de Teste**                                                                    | **Prioridade** |
| ---------- | ---------------------------------------------------------------------------------------- | -------------- |
| US03- CT01 | Validar que é exibida a opção sair ao jogador autenticado                                | Alta           |
| US03- CT02 | Validar que o jogador não consegue acessar páginas protegidas sem uma nova autenticação. | Alta           |
| US03- CT05 | Validar que requisições protegidas sem autenticação válida são rejeitadas pela API.      | Alta           |

_Código da US: US013_ _**Consultar o relatório final da investigação**_

| **ID**     | **Condição de Teste**                                                                                                                                                      | **Prioridade** |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| US13- CT05 | Validar que o sistema impeça a exposição da solução de investigações em andamento ou abandonadas e restringir o acesso aos relatórios pertencentes ao jogador autenticado. | Alta           |

**RN02 — Classificação das missões por dificuldade**

**Cada missão deve possuir obrigatoriamente um dos três níveis de dificuldade:**

- **Fácil (FACIL)**
- **Médio (MEDIO)**
- **Difícil (DIFICIL)**

**A dificuldade deve estar definida nos dados da missão e ser apresentada no catálogo.**

_**Épico relacionado: EP02 — Catálogo e Seleção de Missões.**_

_Código da US: US04 -_ _**Consultar o catálogo de missões**_

| **ID**    | **Condição de Teste**                                                                                                         | **Prioridade** |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------- |
| US04-CT01 | Validar que o sistema apresenta as três missões disponíveis no catálogo: O Último Aplauso, O Quarto 307 e A Carta de Novembro | Alta           |
| US04-CT02 | Validar que cada missão apresenta título, sinopse resumida, dificuldade e status da investigação do jogador.                  | Alta           |

_Código da US: US05_ _**Visualizar detalhes e dificuldades das missões**_

| **ID**    | **Condição de Teste**                                                                                                  | **Prioridade** |
| --------- | ---------------------------------------------------------------------------------------------------------------------- | -------------- |
| US05-CT01 | Validar que cada missão possui um dos níveis de dificuldade previstos: fácil, médio ou difícil.                        | Alta           |
| US05-CT02 | Validar que a dificuldade será apresentada com identificação textual, independentemente de cores ou elementos visuais. | Alta           |
| US05-CT04 | Validar que o catálogo apresenta as quantidades de suspeitos, evidências e dicas previstas para cada caso.             | Alta           |

**RN03 — Desbloqueio de evidências mediante pré-requisitos**

**Determinadas evidências dependem da análise prévia de outras evidências.**

**Uma evidência bloqueada somente pode ser analisada quando todos os seus pré-requisitos tiverem sido cumpridos.**

**A validação deve ocorrer no backend, retornando o erro 422 EVIDENCE\_LOCKED quando houver tentativa de analisar uma evidência ainda bloqueada.**

**O jogador deve conseguir identificar quais evidências estão disponíveis e quais permanecem bloqueadas, sem receber antecipadamente o conteúdo das evidências bloqueadas.**

_**Épico relacionado: EP03 — Gerenciamento das Investigações.**_

_Código da US: US08_ _**Analisar evidências e consultar dicas**_

| **ID**    | **Condição de Teste**                                                                                                                                                   | **Prioridade** |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| US08-CT02 | Validar que as evidências sem pré-requisitos pendentes devem poder ser analisadas pelo jogador.                                                                         | Alta           |
| US08-CT03 | Validar que as evidências dependentes devem permanecer bloqueadas até que todas as evidências exigidas tenham sido analisadas.                                          | Alta           |
| US08-CT04 | Validar que ao analisar uma evidência válida, o sistema registre a ação e atualizar o progresso da investigação, sem contabilizar novamente uma evidência já analisada. | Alta           |

**RN04 — Acusação definitiva após análise de pelo menos três evidências**

**O jogador deve analisar pelo menos três evidências antes de realizar uma acusação definitiva.**

**Cada investigação permite somente uma acusação, que deve conter:**

- **O identificador de um suspeito pertencente à missão.**
- **O identificador de uma evidência que sustente a acusação e tenha sido previamente analisada pelo jogador.**

**Acusações que não atendam a essas condições devem ser recusadas pelo backend, utilizando os erros correspondentes, como 422 INSUFFICIENT\_EVIDENCES, INVALID\_SUSPECT e EVIDENCE\_NOT\_ANALYZED.**

_**Épico relacionado: EP04 — Resolução, Pontuação e Classificação.**_

_Código da US: US11 -_ _**Apresentar uma acusação definitiva**_

| **ID**    | **Condição de Teste**                                                                                                                                                                 | **Prioridade** |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| US11-CT01 | Validar que o sistema permite uma acusação definitiva somente quando o jogador tiver analisado pelo menos três evidências na investigação em andamento.                               | Alta           |
| US11-CT02 | Validar que a acusação contenha um suspeito pertencente à missão e uma evidência previamente analisada pelo jogador.                                                                  | Alta           |
| US11-CT03 | Validar que o sistema impeça acusações com informações ausentes, inválidas ou que não pertençam à investigação.                                                                       | Alta           |
| US11-CT04 | Validar que antes do envio definitivo, o sistema solicite confirmação ao jogador, informando que a decisão encerrará a tentativa e não poderá ser alterada.                           | Alta           |
| US11-CT05 | Validar que após confirmar uma acusação válida, a investigação é encerrada como **Solucionado** ou **Não Solucionado** conforme o suspeito escolhido, impedindo uma segunda acusação. | Alta           |

**RN05 — Pontuação e classificação do detective**

**A pontuação deve ser calculada exclusivamente no backend, considerando os seguintes critérios:**

| **Critério**                                                 | **Pontuação**  |
| ------------------------------------------------------------ | -------------- |
| **Suspeito correto**                                         | **+70 pontos** |
| **Evidência decisiva correta, somente com suspeito correto** | **+30 pontos** |
| **Cada dica utilizada**                                      | **−10 pontos** |
| **Pontuação mínima**                                         | **0 pontos**   |
| **Pontuação máxima**                                         | **100 pontos** |

**Fórmula de cálculo:**

**\\[ P=\\min(100,\\max(0,B-10D)) \\]**

**Onde:**

- **\\(P\\) = pontuação final.**
- **\\(B\\) = 70 pontos pelo suspeito correto, acrescidos de 30 pontos pela evidência decisiva correta quando o suspeito também estiver correto.**
- **\\(D\\) = quantidade de dicas utilizadas.**

**A classificação deve seguir as faixas:**

| **Pontuação** | **Classificação**             |
| ------------- | ----------------------------- |
| **90 a 100**  | **Detetive Mestre**           |
| **70 a 89**   | **Investigador Experiente**   |
| **40 a 69**   | **Detetive Aprendiz**         |
| **0 a 39**    | **Investigação Inconclusiva** |

**A pontuação e a classificação devem ser apresentadas no relatório final. Valores de pontuação enviados pelo frontend devem ser rejeitados pelo backend.**

_**Épico relacionado: EP04 — Resolução, Pontuação e Classificação.**_

_Código da US: US12_ _**Receber pontuação e classificação**_

| **ID**    | **Condição de Teste**                                                                                                                                   | **Prioridade** |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| US12-CT01 | Validar que o sistema atribua 70 pontos quando o suspeito escolhido estiver correto; caso contrário, não deve conceder esses pontos.                    | Alta           |
| US12-CT02 | Validar que o sistema conceda conceder 30 pontos adicionais pela evidência decisiva correta somente quando o suspeito escolhido também estiver correto. | Alta           |
| US12-CT03 | Validar que cada dica utilizada desconte 10 pontos, respeitando a pontuação mínima de zero e máxima de 100.                                             | Alta           |
| US12-CT04 | Validar que a classificação corresponda à faixa de pontuação definida na **RN05.**                                                                      | Alta           |
| US12-CT05 | Validar que a pontuação e classificação é calculada no backend e registradas na tentativa finalizada, sem aceitar valores determinados pelo frontend.   | Alta           |

**RN06 — Salvamento automático e retomada do progresso**

**O progresso da investigação deve ser salvo automaticamente no banco de dados após cada ação confirmada pela API, incluindo:**

- **Início da investigação.**
- **Análise de evidências.**
- **Desbloqueio de evidências.**
- **Utilização de dicas.**
- **Alteração do status da investigação.**

**Após logout, fechamento do navegador ou nova autenticação, o jogador deve conseguir retomar a investigação, desde que os dados permaneçam disponíveis no banco em memória.**

**O logout não deve ser interpretado como abandono da investigação.**

_**Épicos relacionados: EP01 e EP03.**_

_Código da US: US03 Encerrar sessão e proteger o acesso_

| **ID**      | **Condição de Teste**                                                                                             | **Prioridade** |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | -------------- |
| US03 - CT04 | Validar que ao autenticar-se novamente, o jogador consegue recuperar seu progresso enquanto o banco estiver ativo | Alta           |

_Código da US: US07 -_ _**Iniciar e retomar uma investigação**_

| **ID**    | **Condição de Teste**                                                                                                                                  | **Prioridade** |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| US07-CT03 | Validar que o sistema salva automaticamente o progresso após cada ação confirmada pela API.                                                            | Alta           |
| US07-CT04 | Validar que ao retornar à investigação em andamento, o jogador encontre as evidências analisadas, dicas utilizadas e estado anteriormente registrados. | Alta           |
| US07-CT05 | Validar que o logout não encerra nem abandona a investigação, e o progresso permanece disponível enquanto o banco em memória estiver ativo.            | Alta           |

**RN07 — Abandono voluntário da investigação**

**O jogador pode abandonar voluntariamente uma investigação que esteja em andamento.**

**Antes de efetivar o abandono, o sistema deve solicitar uma confirmação no frontend.**

**Ao confirmar o abandono:**

- **A investigação deve receber o status ABANDONADO.**
- **A tentativa não deve receber pontuação.**
- **A investigação não poderá ser retomada.**
- **O progresso registrado deve permanecer disponível para consulta.**

**O cancelamento da confirmação não deve alterar a investigação.**

_**Épico relacionado: EP03 — Gerenciamento das Investigações.**_

_Código da US: US09_ _**Abandonar uma investigação**_

| **ID**     | **Condição de Teste**                                                                                                  | **Prioridade** |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- | -------------- |
| US09- CT01 | Validar que o sistema deve disponibilizar a opção de abandono somente para investigações em andamento.                 | Alta           |
| US09- CT02 | Validar que antes da confirmação, o sistema informe que a tentativa será encerrada e não poderá ser retomada.          | Alta           |
| US09- CT03 | Validar que ao cancelar a confirmação, a investigação permanece em andamento, sem alterações no progresso.             | Alta           |
| US09- CT04 | Validar que ao confirmar o abandono, a tentativa deve receber o status **Abandonado**, sem pontuação ou classificação. | Alta           |
| US09- CT05 | Validar que uma tentativa abandonada não permite novas ações investigativas e não deve revelar a solução do caso.      | Alta           |

**RN08 — Finalização, preservação do histórico e novas tentativas**

**Uma investigação pode ser encerrada com um dos seguintes estados:**

- **SOLUCIONADO: quando o jogador identifica corretamente o suspeito.**
- **NAO\_SOLUCIONADO: quando o jogador identifica incorretamente o suspeito.**
- **ABANDONADO: quando o jogador abandona voluntariamente a investigação.**

**Uma investigação encerrada não pode receber novas ações investigativas, incluindo análises de evidências, utilização de dicas ou acusações. Essas tentativas devem ser rejeitadas com o erro 409 INVESTIGATION\_FINISHED.**

**Entretanto, o jogador pode iniciar uma nova tentativa da mesma missão, preservando integralmente o histórico das tentativas anteriores.**

**Aplicam-se também as seguintes condições documentadas para novas tentativas e histórico:**

- **Cada jogador pode realizar várias tentativas da mesma missão, numeradas sequencialmente.**
- **É permitida no máximo uma tentativa EM\_ANDAMENTO por jogador e missão, inclusive em solicitações simultâneas.**
- **Uma nova tentativa deve iniciar sem evidências analisadas, dicas utilizadas ou acusação registrada.**
- **Tentativas encerradas não podem ser reabertas, substituídas ou modificadas.**
- **O histórico deve apresentar exclusivamente as tentativas do jogador autenticado, da mais recente para a mais antiga.**
- **Tentativas sem pontuação devem ser diferenciadas de tentativas encerradas com pontuação zero.**
- **A solução do mistério somente pode ser revelada nas tentativas finalizadas por acusação.**

_**Épicos relacionados: EP03 e EP04.**_

_Código da US: US06_ _**Selecionar e acessar uma investigação**_

| **ID**      | **Condição de Teste**                                                                                                                                                                | **Prioridade** |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| US06 - CT03 | Validar que quando não existir tentativa ativa e houver tentativas encerradas, o jogador visualize a ação Jogar novamente.                                                           | Alta           |
| US06- CT05  | Validar que ao jogar novamente, o sistema crie uma nova tentativa, sem modificar o histórico anterior, iniciando sem evidências analisadas, dicas utilizadas ou acusação registrada. | Alta           |

_Código da US: US10_ _**Consultar histórico e iniciar novas tentativas**_

| **ID**      | **Condição de Teste**                                                                                                                                                                     | **Prioridade** |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| US10 - CT01 | Validar que o sistema deve apresentar o histórico de tentativas pertencentes ao jogador autenticado, ordenado da mais recente para a mais antiga.                                         | Alta           |
| US10 - CT02 | Validar que cada registro identifique missão, número da tentativa, dificuldade, datas, status, evidências e dicas utilizadas, além de pontuação e classificação quando aplicáveis.        | Alta           |
| US10 - CT03 | Validar que o sistema diferencie investigações sem pontuação de investigações concluídas com zero pontos e apresentar um estado vazio quando não houver histórico.                        | Alta           |
| US10 - CT04 | Validar que uma missão encerrada recebe uma nova tentativa, que deve começar sem evidências analisadas, dicas utilizadas ou acusação, preservando integralmente as tentativas anteriores. | Alta           |
| US10- CT05  | Validar que o sistema impeça mais de uma tentativa em andamento por jogador e missão, inclusive diante de solicitações simultâneas.                                                       | Alta           |

_Código da US: US11 -_ _**Apresentar uma acusação definitiva**_

| **ID**    | **Condição de Teste**                                                                                                                                                                 | **Prioridade** |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| US11-CT05 | Validar que após confirmar uma acusação válida, a investigação é encerrada como **Solucionado** ou **Não Solucionado** conforme o suspeito escolhido, impedindo uma segunda acusação. | Alta           |

_Código da US: US013_ _**Consultar o relatório final da investigação**_

| **ID**      | **Condição de Teste**                                                                                                                                                      | **Prioridade** |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| US13 - CT01 | Validar que após uma acusação definitiva, o sistema disponibiliza o relatório final da tentativa encerrada.                                                                | Alta           |
| US13 - CT03 | Validar que o relatório revele a solução correta e sua explicação somente quando a tentativa tiver sido encerrada por acusação.                                            |                |
| US13 - CT04 | Validar que o jogador consiga consultar novamente os relatórios de suas tentativas anteriores sem modificar os resultados registrados.                                     | Alta           |
| US13- CT05  | Validar que o sistema impeça a exposição da solução de investigações em andamento ou abandonadas e restringir o acesso aos relatórios pertencentes ao jogador autenticado. | Alta           |
