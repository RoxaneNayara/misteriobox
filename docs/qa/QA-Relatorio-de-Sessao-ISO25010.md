# Relatório de Sessão — ISO/IEC 25010: responsividade, usabilidade e compatibilidade

> **Documento autoral de QA — planejamento original.** Conteúdo convertido do arquivo `relatorio_de_sessao_ISO25010_responsividade_usabilidade_e_compatibilidade.docx`
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

| **Data e Hora do Início**       | **Nome do Testador** | **Módulo**                                    |
| ------------------------------- | -------------------- | --------------------------------------------- |
| 24 de novembro de 2026 14:45 PM | Roxane Nayara        | Responsividade, Usabilidade e Compatibilidade |

**Test Charter:**  
_Explore_ a aplicação Mistério Box

_Com_ as características de Software da ISO 25010 Responsividade, Usabilidade e Compatibilidade

_Para descobrir_ se o software se adapta aos tamanhos de tela, browsers diversos e é fácil e intuitivo ao usuário

_Browsers: Chrome e Safari_

**Tamanho da Sessão:**  
20 minutos

**Notas\*:**

- (I) Verificado que menu geral fica mais localizado a esquerda da tela.
- (I) Verifiquei que não tem um botão de “voltar ao topo” nas versões responsivas

_(\*) Podem ser (I)nformações ou (R)iscos._

**Defeitos:**

- Nos tamanho 420x818 à 463x818 – 647x818 à 681x818, o menu secundário com os itens: O caso, Suspeitos, Evidencias, Dicas e Acusações, não fica fixo, impedindo o usuário o acesso rápido.
  - Defeito: Corrigido – Vide defeito\_ISO25010\_responsividade-B05\_docx
- O menu secundário fica cortado e com espaço entre o menu principal.
  - Defeito: Corrigido – Vide defeito\_ISO25010\_responsividade-B05\_docx

**Perguntas:**

- O Menu deveria ficar localizado à esquerda? Principalmente o botão sair no modo responsivo para tablet (680X818) e celular?
- Verificar a possibilidade de botão “Voltar ao topo”. Melhoria
- Ao copiar o link da página aberta no histórico do caso, e colar em outro navegador, ele direciona para a página de login. Ao colocar a senha utilizada na sessão anterior, ele retoma da página que estava aberta, como por exemplo: o histórico.
