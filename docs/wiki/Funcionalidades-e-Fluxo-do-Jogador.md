# Funcionalidades e fluxo do jogador

[← Início](Home) · Próxima: [Arquitetura e tecnologias](Arquitetura-e-Tecnologias)

## Fluxo principal

```
Cadastro / login → Catálogo de casos → Investigação → Acusação → Relatório final
                          ▲                 │                         │
                          └── Meu histórico ◄┴── sair e voltar depois ─┘
```

1. **Cadastro e login.** O jogador informa nome, e-mail e senha. As regras de validação estão em
   [Regras de negócio](Regras-de-Negocio-e-Criterios-de-Aceitacao#validação-do-cadastro).
2. **Catálogo.** Abre com a credencial do detetive e três indicadores calculados a partir dos dados
   reais do jogador: **Casos disponíveis**, **Em andamento** e **Solucionados** (missões distintas
   resolvidas). Em seguida vem o **Arquivo central de casos**, com os dossiês organizados em três
   setores.
3. **Investigação.** História, suspeitos e depoimentos, evidências e dicas. Algumas evidências só
   ficam disponíveis depois da análise de outras (RN03). Cada ação confirmada pela API é salva
   automaticamente; uma notificação temporária confirma a análise de evidências e a revelação de
   dicas.
4. **Acusação.** Depois de analisar pelo menos três evidências, o jogador escolhe um suspeito e a
   evidência que sustenta a acusação. Só existe uma acusação por tentativa (RN04).
5. **Relatório final.** Mostra pontuação, classificação e a acusação feita. A solução completa só
   é revelada a partir de **50 pontos** (RN08).
6. **Meu histórico.** Lista todas as tentativas, da mais recente para a mais antiga, com acesso ao
   relatório ou ao registro de cada uma.

## Catálogo de missões

| Setor                                        | Missões                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| Investigações iniciais (Fácil)               | O Último Aplauso · A Assinatura Falsa · O Troféu Trocado                      |
| Investigações especiais (Médio)              | O Quarto 307 · O Segredo da Galeria · O Voto Decisivo                         |
| Investigações de alta complexidade (Difícil) | A Carta de Novembro · Protocolo Zero · O Testamento Impossível · O Arquivo 17 |

A seção **Divisões especializadas — Em breve** é apenas informativa: não tem páginas, cobrança nem
controle de acesso.

A dificuldade não depende só do número de evidências. A validação de integridade
(`mission-integrity.ts`)
exige, por nível, um mínimo de suspeitos e dicas e uma cadeia mínima até a evidência decisiva. Nas
missões difíceis, a prova decisiva cruza linhas de investigação independentes.

## Estados de uma tentativa

| Status            | Quando acontece                         | Pontuação              |
| ----------------- | --------------------------------------- | ---------------------- |
| `EM_ANDAMENTO`    | Missão iniciada e ainda sem acusação    | sem pontuação (`null`) |
| `SOLUCIONADO`     | Acusação com o suspeito correto         | numérica (0 a 100)     |
| `NAO_SOLUCIONADO` | Acusação com o suspeito incorreto       | `0`                    |
| `ABANDONADO`      | Abandono confirmado pelo jogador (RN07) | sem pontuação (`null`) |

- **Sair não abandona.** Logout, fechamento do navegador ou expiração da sessão preservam a
  investigação; após novo login o jogador continua de onde parou (RN06).
- **Novas tentativas.** Missões encerradas exibem "Jogar novamente". A nova tentativa começa do
  zero, e as anteriores continuam no histórico, sem alteração (RN08).

## Sessão

| Item        | Comportamento                                                          |
| ----------- | ---------------------------------------------------------------------- |
| Inatividade | Expira após 30 minutos sem atividade                                   |
| Limite      | 8 horas desde o login, mesmo com atividade contínua                    |
| Renovação   | Automática durante o uso, no máximo a cada 5 minutos                   |
| Logout      | Limpa a sessão em todas as abas; não há revogação do token no servidor |

## Persistência

| Ambiente                                      | Banco                                          | Duração dos dados                                     |
| --------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| Production (Vercel)                           | MongoDB Atlas                                  | Persistentes                                          |
| Preview (Vercel)                              | Banco Atlas próprio, separado do de Production | Exigido pela API; sem ele, a API de prévia não inicia |
| Local sem `MONGODB_URI` (padrão), testes e CI | MongoDB em memória                             | Somem quando a API reinicia                           |

## Acessibilidade e responsividade

- Cabeçalho, menu da investigação, notificações e botão "Voltar ao topo" verificados em várias
  larguras, de 320 px a 1280 px, nos testes de ponta a ponta.
- Navegação por teclado com a opção focada sempre visível; notificações anunciadas por região viva
  (`aria-live`); preferência de movimento reduzido respeitada.

Detalhes em [Testes automatizados e ferramentas](Testes-Automatizados-e-Ferramentas).
