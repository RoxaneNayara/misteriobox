# Relatório de Sessão — Encerrar sessão, proteger acesso e consultar relatório final

> **Documento autoral de QA — planejamento original.** Conteúdo convertido do arquivo `relatorio_de_sessao_US01_encerrar_sessão_proteger_acesso_consultar-relatorio_final.docx`
> sem resumir, combinar ou reescrever condições de teste. O cabeçalho e o rodapé do modelo de
> documento (material de curso) não foram reproduzidos. A ISO/IEC/IEEE 29119-3 foi usada como **base metodológica**; este documento não declara conformidade integral com a norma.
>
> Este é o **planejamento original** (novembro de 2026). O comportamento atual da aplicação e a
> cobertura automatizada atual estão em [Regras de negócio](Regras-de-Negocio-e-Criterios-de-Aceitacao),
> [Testes automatizados](Testes-Automatizados-e-Ferramentas) e
> [Rastreabilidade acadêmica](QA-Rastreabilidade-Academica).

---

**Relatório de Sessão**

Inspirado no artigo de James Marcus Bach e Jonathan Bach sobre Session-Based Test Management (2001)

| **Data e Hora do Início**       | **Nome do Testador** | **Módulo**          |
| ------------------------------- | -------------------- | ------------------- |
| 24 de novembro de 2026 12:00 PM | Roxane Nayara        | Cadastro de jogador |

**Test Charter:**  
_Explore_ a Funcionalidade de Cadastro de jogador

_Com_ a Heurística de **Testes de UI** com foco em Adotar a Abordagem Contrária

_Para descobrir_ se o software lida bem com situações onde o usuário tenta ações contrárias a regra de negócios

_Código da US: US03 Encerrar sessão e proteger o acesso_

_Código da US: US013_ _**Consultar o relatório final da investigação**_

**Tamanho da Sessão:**  
15 minutos

**Notas\*:**

- (I) Testes realizados em uma aba anônima. Dados de usuário não persistem.
- (I) Ao encerrar a sessão e clicar no botão voltar, dados de usuário não persistem.
- (R) Risco identificado de acesso a dados de usuário logado anteriormente. (H - **Testes de UI -** Manipular URL e Botão Voltar**)**.

_(\*) Podem ser (I)nformações ou (R)iscos._

**Defeitos:**

- (R) Realizado testes apagando um numero da URL, ao digitar o numero denovo, recupera os dados da conta anteriormente logada. (H - **Testes de UI -** Manipular URL e Botão Voltar**)**. O mesmo acontece com o botão voltar.
  - defeito\_US03\_CT03 -B04\_encerrar\_sessao\_e\_proteger\_acesso

**Perguntas:**

N/A
