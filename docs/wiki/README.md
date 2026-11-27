# Rascunho da GitHub Wiki

Páginas da Wiki da MistérioBox, versionadas aqui para revisão antes da publicação. Os links entre
páginas usam o formato da Wiki (`[texto](Nome-da-Pagina)`) e só funcionam depois de publicados; na
revisão pelo pull request, abra cada arquivo pelo nome.

| Arquivo                                          | Página da Wiki                               |
| ------------------------------------------------ | -------------------------------------------- |
| `Home.md`                                        | Início                                       |
| `Funcionalidades-e-Fluxo-do-Jogador.md`          | Funcionalidades e fluxo do jogador           |
| `Arquitetura-e-Tecnologias.md`                   | Arquitetura e tecnologias                    |
| `Regras-de-Negocio-e-Criterios-de-Aceitacao.md`  | Regras de negócio e critérios de aceitação   |
| `Estrategia-de-Testes-e-Quality-Engineering.md`  | Estratégia de testes e Quality Engineering   |
| `Testes-Automatizados-e-Ferramentas.md`          | Testes automatizados e ferramentas           |
| `Integracao-Continua-e-Implantacao.md`           | Integração contínua e implantação            |
| `Gestao-de-Defeitos-Riscos-e-Rastreabilidade.md` | Gestão de defeitos, riscos e rastreabilidade |
| `Seguranca-e-Privacidade.md`                     | Segurança e privacidade                      |
| `Execucao-Local-e-Contribuicao.md`               | Execução local e contribuição                |
| `_Sidebar.md`, `_Footer.md`                      | Menu lateral e rodapé                        |

## Política de links

A Wiki será publicada no **repositório público de apresentação**, enquanto este repositório de
desenvolvimento continua privado. Por isso:

- **Arquivos do código** aparecem como caminhos em texto (por exemplo, `backend/src/services/`), e
  não como links: os caminhos são os mesmos no repositório de apresentação e não dependem do nome
  que ele vier a ter.
- **Issues e pull requests** do repositório privado não são linkados. Defeitos são citados pelo
  identificador `Bxx`, que também aparece nos testes de regressão.
- **Links externos** usados: apenas a aplicação publicada, `https://misteriobox.vercel.app`.
- **Links internos** usam o nome da página da Wiki, sem extensão.

## Antes de publicar (checklist)

- [ ] Repositório de apresentação criado, com histórico novo e sem as soluções das missões.
- [ ] Conferir se os caminhos citados nas páginas existem no repositório de apresentação. Os
      testes que dependem das soluções (`solution-reveal`, `mission-catalog`, `published-catalog`,
      `mission-catalog-flow`) podem ser adaptados ou omitidos na versão pública; nesse caso,
      ajustar as tabelas de cobertura e de rastreabilidade.
- [ ] Ativar a Wiki no repositório de apresentação (_Settings → Features → Wikis_) e criar a
      primeira página pela interface.
- [ ] Copiar os arquivos desta pasta (exceto este `README.md`) para o clone da Wiki
      (`<repositório-de-apresentação>.wiki.git`), fazer o commit e o push.
- [ ] Conferir o menu lateral e a navegação entre as páginas publicadas.
