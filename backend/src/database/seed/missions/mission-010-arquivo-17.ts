import type { Mission } from '../../../models/mission.model';

export const missionArquivo17: Mission = {
  missionId: 'missao-010',
  order: 10,
  title: 'O Arquivo 17',
  theme: 'Adulteração de testemunhos',
  difficulty: 'DIFICIL',
  synopsis:
    'Há dez anos, um motorista foi condenado pelo roubo de um malote de dinheiro com base em depoimentos ' +
    'colhidos por uma investigação interna. Agora, as fitas originais desses depoimentos foram encontradas ' +
    'na caixa de arquivo número 17 — e elas não dizem o mesmo que as transcrições. Reconstrua a cronologia ' +
    'daquela manhã e descubra quem realmente está por trás do roubo.',
  story:
    'Transportes Serra Azul, 15 de março de 2016. Às 9h, o malote com R$ 800 mil da folha de pagamento ' +
    'saiu da tesouraria no carro-forte, com o motorista Wellington Dias e o vigilante Fábio Lacerda. Às 9h42, ' +
    'na agência bancária, o malote foi aberto diante da câmera: dentro, só papel cortado. A sindicância ' +
    'interna concluiu que Wellington trocou o dinheiro durante uma parada de doze minutos num posto de ' +
    'combustível, e a polícia usou essas conclusões; ele foi condenado. Em 2026, a caixa de arquivo nº 17 ' +
    'da empresa foi aberta para descarte, e dentro dela estavam as fitas com o áudio original dos ' +
    'depoimentos. A Justiça pediu à agência uma revisão completa do caso. Cinco pessoas estiveram no ' +
    'caminho do malote — ou dos papéis que contaram a sua história.',
  suspects: [
    {
      suspectId: 'wellington-dias',
      name: 'Wellington Dias',
      role: 'Motorista do carro-forte (condenado)',
      description:
        'Cumpriu seis anos de pena. Sempre negou o roubo e pediu a revisão do caso quando as fitas apareceram.',
      testimony:
        'A gente parou uns três minutos no posto. Eu desci para pagar o combustível e voltei. O Fábio ficou ' +
        'no carro o tempo todo, com o malote. Nunca abri malote nenhum.',
    },
    {
      suspectId: 'fabio-lacerda',
      name: 'Fábio Lacerda',
      role: 'Vigilante da escolta',
      description:
        'Acompanhava o malote no banco de trás. Nas transcrições de 2016, é a principal testemunha contra Wellington.',
      testimony:
        'Eu fiquei no carro, de olho no malote, o tempo todo. Nunca disse que fui ao banheiro. Assinei os ' +
        'papéis da sindicância sem ler: a tesoureira disse que era só formalidade.',
    },
    {
      suspectId: 'ines-correa',
      name: 'Inês Corrêa',
      role: 'Tesoureira da empresa',
      description:
        'Preparou e lacrou o malote. Conduziu a sindicância interna e transcreveu os depoimentos.',
      testimony:
        'Lacrei o malote às 8h05 com a conferente, como manda o procedimento de conferência dupla. Conduzi a ' +
        'sindicância com toda a seriedade, e ela mostrou que o dinheiro sumiu no posto de combustível.',
    },
    {
      suspectId: 'aurelio-nogueira',
      name: 'Aurélio Nogueira',
      role: 'Gerente da agência bancária',
      description: 'Recebeu o malote no banco e abriu o lacre diante da câmera de segurança.',
      testimony:
        'O malote chegou às 9h40 com o lacre intacto. Abri na frente da câmera, como manda o protocolo, e ' +
        'dentro havia apenas papel cortado no tamanho das cédulas.',
    },
    {
      suspectId: 'rita-saldanha',
      name: 'Rita Saldanha',
      role: 'Conferente da tesouraria',
      description:
        'Responsável pela segunda conferência dos malotes. O nome dela aparece no registro de lacre daquele dia.',
      testimony:
        'Em março de 2016 eu estava de férias. Não sei como o meu nome foi parar no registro daquele malote. ' +
        'Ninguém nunca me perguntou nada.',
    },
  ],
  evidences: [
    {
      evidenceId: 'ev-01',
      title: 'Relatório final da sindicância interna (2016)',
      content:
        'Assinado por Inês Corrêa em 25/03/2016: "Às 9h15 o carro-forte parou no Posto Serrano. O vigilante ' +
        'foi ao banheiro e o motorista ficou doze minutos sozinho com o malote. Conclusão: a troca do ' +
        'dinheiro ocorreu nesse intervalo." Base: transcrições dos depoimentos anexadas (Arquivo 17).',
      requires: [],
    },
    {
      evidenceId: 'ev-02',
      title: 'Transcrições dos depoimentos (Arquivo 17)',
      content:
        'Fábio Lacerda: "Paramos às 9h15. Fui ao banheiro e o Wellington ficou sozinho com o malote." ' +
        'Frentista do posto: "O carro-forte ficou parado uns doze minutos." Porteiro: "O carro saiu da ' +
        'empresa às 9h." Todas as páginas foram digitadas e trazem a rubrica dos depoentes no rodapé.',
      requires: [],
    },
    {
      evidenceId: 'ev-03',
      title: 'Fitas originais dos depoimentos',
      content:
        'Áudio de Fábio Lacerda (17/03/2016): "Paramos às 9h15 para abastecer. Eu fiquei no carro o tempo ' +
        'todo; o Wellington desceu para pagar e voltou rapidinho." Áudio do frentista: "Foi coisa de dois, ' +
        'três minutos." A voz que conduz as entrevistas é a de Inês Corrêa. As fitas estavam no fundo da ' +
        'caixa, sob as transcrições.',
      requires: ['ev-02'],
    },
    {
      evidenceId: 'ev-04',
      title: 'Tacógrafo e comprovante do posto',
      content:
        'Tacógrafo do carro-forte em 15/03/2016: saída às 9h00; parada das 9h15 às 9h18; chegada ao banco às ' +
        '9h40. Comprovante da máquina de cartão do Posto Serrano: pagamento às 9h17, assinado por Wellington ' +
        'Dias. Nenhuma parada de doze minutos.',
      requires: ['ev-01'],
    },
    {
      evidenceId: 'ev-05',
      title: 'Lacre e gravação do banco',
      content:
        'A câmera da agência mostra Aurélio Nogueira abrindo o malote às 9h42: lacre nº 55102, intacto. Os ' +
        'lacres da Serra Azul são numerados em sequência e ficam no cofre da tesouraria, cuja chave é ' +
        'exclusiva da tesoureira. O lacre 55102 foi o único retirado do cofre naquele dia.',
      requires: ['ev-01'],
    },
    {
      evidenceId: 'ev-06',
      title: 'Livro de lacres da tesouraria',
      content:
        '15/03/2016, 8h05: "Malote da folha — R$ 800.000,00 — lacre 55102." Assinaturas: Inês Corrêa ' +
        '(tesoureira) e Rita Saldanha (conferente). O procedimento exige que as duas contem o dinheiro juntas ' +
        'antes de lacrar.',
      requires: ['ev-05'],
    },
    {
      evidenceId: 'ev-07',
      title: 'Ponto eletrônico da tesouraria',
      content:
        'Rita Saldanha: férias de 1º a 20 de março de 2016, sem nenhum registro de entrada no período. Inês ' +
        'Corrêa, em 15/03/2016: entrada às 6h40, duas horas antes do horário normal. Ninguém mais entrou na ' +
        'tesouraria antes das 8h30.',
      requires: ['ev-04', 'ev-06'],
    },
    {
      evidenceId: 'ev-08',
      title: 'Metadados das transcrições',
      content:
        'Os arquivos de texto das transcrições foram criados em 22/03/2016 no computador da tesouraria, pelo ' +
        'usuário "icorrea", e alterados cinco vezes até 24/03. O procedimento interno determinava que o RH, e ' +
        'não a tesouraria, transcrevesse depoimentos de sindicâncias.',
      requires: ['ev-03'],
    },
    {
      evidenceId: 'ev-09',
      title: 'Exame da assinatura no livro de lacres',
      content:
        'A assinatura atribuída a Rita Saldanha em 15/03/2016 é uma imitação: o traço é lento e retocado, ' +
        'diferente das assinaturas autênticas dela no mesmo livro. A letra do "R" coincide com a de anotações ' +
        'feitas por Inês Corrêa nas páginas vizinhas.',
      requires: ['ev-06'],
    },
    {
      evidenceId: 'ev-10',
      title: 'Escritura de imóvel',
      content:
        'Em 28 de abril de 2016, Inês Corrêa quitou um apartamento em Petrópolis, pagando R$ 310 mil em ' +
        'espécie, segundo a escritura. O salário anual dela na época era de R$ 96 mil.',
      requires: ['ev-07'],
    },
    {
      evidenceId: 'ev-11',
      title: 'Relatório policial de 2016',
      content:
        'O delegado registrou que a investigação policial se baseou nas transcrições e no relatório da ' +
        'sindicância entregues pela empresa. As fitas de áudio não foram enviadas à polícia; a empresa ' +
        'informou que "não havia gravações".',
      requires: [],
    },
  ],
  hints: [
    {
      hintId: 'dica-1',
      text:
        'A sindicância fala em doze minutos de parada. Existem registros dessa manhã que não dependem do ' +
        'que alguém disse.',
      relatedEvidenceId: 'ev-04',
    },
    {
      hintId: 'dica-2',
      text:
        'Se o lacre chegou intacto ao banco, onde o dinheiro poderia ter sido trocado? Volte ao momento em ' +
        'que o malote foi fechado.',
      relatedEvidenceId: 'ev-05',
    },
    {
      hintId: 'dica-3',
      text: 'Compare o que as testemunhas falaram nas fitas com o que foi escrito no papel.',
      relatedEvidenceId: 'ev-03',
    },
  ],
  solution: {
    culpritSuspectId: 'ines-correa',
    decisiveEvidenceId: 'ev-07',
    explanation:
      'Inês Corrêa roubou o dinheiro e adulterou os testemunhos. No dia 15 de março de 2016 ela chegou à ' +
      'tesouraria às 6h40, sozinha, montou o malote com papel cortado e o fechou com o lacre 55102, ' +
      'imitando a assinatura da conferente Rita Saldanha, que estava de férias. O lacre chegou intacto ao ' +
      'banco, então a troca não poderia ter acontecido no caminho: o tacógrafo e o comprovante do posto ' +
      'mostram uma parada de apenas três minutos, e não de doze. Para sustentar a versão contra Wellington, ' +
      'Inês conduziu a sindicância, gravou os depoimentos e digitou transcrições alteradas — no áudio, Fábio ' +
      'diz que ficou no carro e o frentista fala em dois ou três minutos —, colheu as rubricas dizendo que era ' +
      'formalidade e informou à polícia que não havia gravações. A prova decisiva é o ponto eletrônico: ele ' +
      'mostra que Rita não esteve na tesouraria e que Inês estava sozinha com o dinheiro antes do lacre, o ' +
      'que desmente seu depoimento sobre a conferência dupla. Wellington e Fábio nunca tiveram acesso aos ' +
      'lacres; Aurélio abriu o malote intacto diante da câmera. A compra do apartamento em espécie, um mês ' +
      'depois, confirma o destino de parte do dinheiro.',
  },
};
