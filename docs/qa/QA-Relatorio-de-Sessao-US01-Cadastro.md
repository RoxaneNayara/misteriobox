# Relatório de Sessão — US01 Cadastrar-se como detetive

> **Documento autoral de QA — planejamento original.** Conteúdo convertido do arquivo `relatorio_de_sessao_US01_cadastrar_se_como_detetive.docx`
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
| 20 de novembro de 2026 14:13 PM | Roxane Nayara        | Cadastro de jogador |

**Test Charter:**  
_Explore_ a Funcionalidade de Cadastro de jogador

_Com_ a Heurística de **Ataque de tipo de Dados** e **Testes de Strings** com foco em evitar ataques via input.

_Para descobrir_ se os campos atendem ao comportamento referente a strings e dados estabelecidos

_Código da US: US01 - Cadastrar-se como detetive_

**Tamanho da Sessão:**  
30 minutos

**Notas\*:**

- (I) Consegui cadastrar um jogador com o @123
- (I) Consegui cadastrar um jogador com essa senha “1a\*, ?, /, ,)”.
- (R) aplicação susceptível a ataques pelos não tratamentos dos campos.
- (I) Os testes foram realizados na API e no frontend

_(\*) Podem ser (I)nformações ou (R)iscos._

**Defeitos:**

- Não há tratamento no campo “Nome” para caracteres especiais. ( \*, ?, /, ,) ( H – Ataques de Tipos de dados - Caracteres especiais no nome)
  - Corrigido Vide defeito: **US01-CT04 -B01**
- Nome longo grudado quebra layout (Flavio FlavioFlavioFlavioFlavioFlavioFlavioFlavioFlavioFlavioFlavioFlavioFlavioF) (H – Ataques de Tipos de dados – Sem espaços)
  - Corrigido Vide defeito: **US01-CT05 -B02**
- Não há tratamento no campo “Nome” e e-mail para nomes com espaços no inicio ou no fim do campo nome.(H – Espaços no inicio ou no fim)
  - Fechado Vide defeito: **US01-CT04 -B03**
- Não há tratamento no campo “e-mail” para e-mails com caracteres especiais delimitadores. (“mariansa''llaw@example.com ") (H – Espaços no inicio ou no fim)
  - Corrigido Vide defeito: **US01-CT04 -B03**

**Perguntas:**

- Deveria ser possível cadastrar jogador com esse @123?
- Letra com acento não é contabilizada como letra, deveria ser? (à, á, â, ã, ä, ç, è, é, ê, ë)(H – caracteres acentuados)
  - Resposta: Até é aceito, porém precisa ter letras sem acento e números para ser aceito
