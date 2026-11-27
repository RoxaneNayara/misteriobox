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
| `Execucao-Local-e-Contribuicao.md`               | Execução local e contribuição                |
| `_Sidebar.md`, `_Footer.md`                      | Menu lateral e rodapé                        |

## Publicação (após aprovação)

A Wiki do GitHub é um repositório separado (`misteriobox.wiki.git`). Em repositório privado, ela
exige plano pago; em repositório público, basta ativá-la em _Settings → Features → Wikis_ e criar
a primeira página pela interface. Depois:

```bash
git clone https://github.com/RoxaneNayara/misteriobox.wiki.git
```

Copie os arquivos desta pasta (exceto este `README.md`) para o clone, faça o commit e o push.
