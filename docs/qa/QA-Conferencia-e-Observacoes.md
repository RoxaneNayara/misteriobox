# Conferência da conversão e observações

Esta página registra como os documentos autorais de QA foram convertidos de DOCX para Markdown e
como a fidelidade foi verificada. Nenhum conteúdo foi resumido, combinado, eliminado ou reescrito.

## Organização dos documentos

Os documentos originais de QA da MistérioBox são:

1. **Plano e Estratégia de Testes** — **um único documento**, organizado internamente em quatro
   épicos, com histórias de usuário, condições de teste, resultados esperados, camadas, técnicas,
   missões exploratórias, testes não funcionais e estratégia de automação.
2. **Condições de Teste.**
3. **Relatórios de Sessão** (testes exploratórios), um por sessão.

Além deles, a Wiki traz **páginas de navegação e material complementar**, que não são documentos
originais:

- **Recortes de navegação** dos Épicos 01 e 02: trechos literais do Plano e Estratégia de Testes,
  agrupados por épico para facilitar a consulta.
- **Rastreabilidade acadêmica**: matriz montada a partir do plano e dos testes automatizados.
- **Esta página de conferência.**

## Documentos originais publicados

| Página                                                                                            | Documento de origem                                                                       | Parágrafos conferidos | Células de tabela | Linhas de tabela (DOCX = MD) | Histórias (US) | Linhas de condição (US-CT)            | Faltando |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------- | ----------------- | ---------------------------- | -------------- | ------------------------------------- | -------- |
| [Plano e Estratégia de Testes — Completo](QA-Plano-e-Estrategia-de-Testes-Completo)               | `plano_e_estrategia_de_testes_misteriobox.docx`                                           | 489                   | 403               | 106 = 106                    | 13             | 67 (seção 3) + 4 (seção 7, automação) | 0        |
| [Condições de Teste](QA-Condicoes-de-Teste)                                                       | `condicoes_de_testes_misteriobox.docx`                                                    | 327                   | 234               | 82 = 82                      | —              | 55 (53 identificadores distintos)     | 0        |
| [Relatório de Sessão — US01 Cadastro](QA-Relatorio-de-Sessao-US01-Cadastro)                       | `relatorio_de_sessao_US01_cadastrar_se_como_detetive.docx`                                | 32                    | 6                 | 2 = 2                        | —              | —                                     | 0        |
| [Relatório de Sessão — US02, US03 e US04](QA-Relatorio-de-Sessao-US02-US03-US04)                  | `relatorio_de_sessao_US02_US03_US04_autenticar_encerrar_sessao_consultar_catálogo.docx`   | 24                    | 6                 | 2 = 2                        | —              | —                                     | 0        |
| [Relatório de Sessão — Sessão e relatório final](QA-Relatorio-de-Sessao-Sessao-e-Relatorio-Final) | `relatorio_de_sessao_US01_encerrar_sessão_proteger_acesso_consultar-relatorio_final.docx` | 24                    | 6                 | 2 = 2                        | —              | —                                     | 0        |
| [Relatório de Sessão — API de investigações](QA-Relatorio-de-Sessao-API-Investigacoes)            | `relatorio_de_sessao_API_investigacoes.docx`                                              | 20                    | 6                 | 2 = 2                        | —              | —                                     | 0        |
| [Relatório de Sessão — ISO/IEC 25010](QA-Relatorio-de-Sessao-ISO25010)                            | `relatorio_de_sessao_ISO25010_responsividade_usabilidade_e_compatibilidade.docx`          | 26                    | 6                 | 2 = 2                        | —              | —                                     | 0        |

## Recortes de navegação (não são documentos originais)

| Página                                                          | Conteúdo                                       | Seções do plano incluídas | Linhas de condição         |
| --------------------------------------------------------------- | ---------------------------------------------- | ------------------------- | -------------------------- |
| [Épico 01 — recorte](QA-EP01-Gestao-de-Usuarios-e-Autenticacao) | Trechos literais do Épico 01 no plano completo | 1, 2, 3, 5 e 7            | 17 (seção 3) + 4 (seção 7) |
| [Épico 02 — recorte](QA-EP02-Catalogo-e-Selecao-de-Missoes)     | Trechos literais do Épico 02 no plano completo | 1, 2, 3 e 5               | 15 (seção 3)               |

Cada trecho dos recortes foi conferido como cópia literal do documento completo. As seções do plano
que não são divididas por épico (técnicas de teste e testes não funcionais) ficam apenas no
documento completo.

**Método de conferência dos originais:** cada parágrafo e cada célula de tabela do DOCX (texto do
corpo do documento) foi procurado, literalmente, no Markdown publicado, e o número de linhas de
tabela foi comparado. Nos relatórios de sessão, os campos "Test Charter" e "Tamanho da Sessão" têm
uma quebra de linha entre o rótulo e o valor no original; a quebra foi mantida no Markdown.

**Não publicados:**

- Relatórios de defeito (`defeito_*.docx`): registrados como Issues do repositório (B01–B13).
- Modelos e materiais do curso (cabeçalhos, rodapés e documentos-modelo): não são de autoria do
  projeto e não foram reproduzidos. A conversão usa as versões de publicação dos documentos, cujo
  cabeçalho e rodapé já indicam "Modelo de documentação de testes de origem acadêmica, adaptado para
  o projeto MistérioBox".

## Observações sobre o conteúdo original (preservado sem alteração)

| Documento               | Observação                                                                                                                                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plano completo, seção 2 | As tabelas de histórias dos Épicos 03 e 04 têm o título "Catálogo e Seleção de Missões" (mesmo título do Épico 02). Na seção 1 e na seção 3, os nomes são "Gerenciamento das Investigações" e "Resolução, Pontuação e Classificação". |
| Plano completo, seção 2 | A história do histórico aparece como `US010`; nas condições, como `US10`.                                                                                                                                                             |
| Plano completo e EP01   | Alguns identificadores têm espaços (`US03 - CT01`, `US10 - CT01`). Foram mantidos como no original.                                                                                                                                   |
| Plano completo          | "Baseado na ISO-29119-3" está escrito assim no original; a referência é à ISO/IEC/IEEE 29119-3, usada como base metodológica, sem declaração de conformidade integral.                                                                |
| Condições de Teste      | `US11-CT05` e `US13-CT05` aparecem duas vezes: na tabela da história e novamente na seção que reúne as condições de novas tentativas e histórico (RN08).                                                                              |

## Planejamento original × estado atual

Os documentos refletem o planejamento feito em novembro de 2026. Alterações posteriores do
produto não foram aplicadas a eles:

| Condição original                                                                              | Estado atual da aplicação                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `US04-CT01` — catálogo com três missões (O Último Aplauso, O Quarto 307 e A Carta de Novembro) | O catálogo foi ampliado para 10 missões (3 fáceis, 3 médias, 4 difíceis); as três originais foram preservadas.                                                                             |
| `US03 - CT04` — recuperar o progresso "enquanto o banco estiver ativo"                         | Em produção, o banco é o MongoDB Atlas, persistente; o banco em memória é usado só localmente e nos testes.                                                                                |
| Seção 7 (Automação) — 4 condições do Épico 01                                                  | As 4 condições foram automatizadas (API e interface). Além delas, o projeto ganhou testes organizados por regra de negócio; ver [Rastreabilidade acadêmica](QA-Rastreabilidade-Academica). |
