# Relatório de Sessão — US02, US03 e US04 (autenticar, encerrar sessão, consultar catálogo)

> **Documento autoral de QA — planejamento original.** Conteúdo convertido do arquivo `relatorio_de_sessao_US02_US03_US04_autenticar_encerrar_sessao_consultar_catálogo.docx`
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

| **Data e Hora do Início**       | **Nome do Testador** | **Módulo**                  |
| ------------------------------- | -------------------- | --------------------------- |
| 20 de novembro de 2026 15:08 PM | Roxane Nayara        | Autenticar-se na Plataforma |

**Test Charter:**  
_Explore_ a Funcionalidade de Autenticação na Plataforma

_Com_ exploratórios AD-HOC

_Para descobrir_ se a autenticação está funcional

_Código da US: US02 Autenticar-se na plataforma_

_Código da US: US03 Encerrar sessão e proteger o acesso_

_Código da US: US04 -_ _**Consultar o catálogo de missões**_

**Tamanho da Sessão:**  
15 minutos

**Notas\*:**

- (I) Tentativa de Token inválido:
  - Com espaços apenas
  - **Com letras e números aletórios**
  - **Com caracteres especiais**

_(\*) Podem ser (I)nformações ou (R)iscos._

**Defeitos:**

**Perguntas:**

- Tempo de expiração do token, é de 8h. Está correto de acordo coma convenção?
