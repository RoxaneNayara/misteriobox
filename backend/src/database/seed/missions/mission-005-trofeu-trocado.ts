import type { Mission } from '../../../models/mission.model';

export const missionTrofeuTrocado: Mission = {
  missionId: 'missao-005',
  order: 5,
  title: 'O Troféu Trocado',
  theme: 'Sabotagem em premiação',
  difficulty: 'FACIL',
  synopsis:
    'Na final de um concurso de gastronomia transmitido pela TV, o troféu entregue ao vencedor trazia o ' +
    'nome errado. As notas do júri contam outra história. Alguém trocou o resultado entre a apuração e a ' +
    'cerimônia. Descubra quem sabotou a premiação.',
  story:
    'Concurso Colher de Ouro, sábado à noite. Às 18h45, o júri entregou o envelope lacrado com o nome do ' +
    'vencedor à organização. Às 20h30, diante das câmeras, o apresentador abriu o envelope e anunciou o ' +
    'chef Paulo Rangel; o troféu já gravado com o nome dele foi entregue sob aplausos. Na manhã seguinte, ' +
    'a presidente do júri viu a reprise e telefonou indignada: a vencedora tinha sido a chef Irene Sato. ' +
    'Entre a apuração e a cerimônia, três pessoas lidaram com o resultado ou com o troféu.',
  suspects: [
    {
      suspectId: 'paulo-rangel',
      name: 'Paulo Rangel',
      role: 'Chef finalista',
      description:
        'Chef executivo do Grupo Rangel, rede de restaurantes da família. Ficou em segundo lugar no ano anterior.',
      testimony:
        'Das 18h30 às 20h20 eu estava no camarim dos finalistas, dando entrevista para a equipe da TV. Nem ' +
        'sabia onde ficava o envelope. Fiquei tão surpreso quanto todo mundo quando ouvi meu nome.',
    },
    {
      suspectId: 'denise-couto',
      name: 'Denise Couto',
      role: 'Organizadora do concurso',
      description:
        'Produz o Colher de Ouro há seis edições e negocia pessoalmente os contratos de patrocínio.',
      testimony:
        'Recebi o envelope lacrado do júri e o entreguei direto ao apresentador, sem abrir. Não falei com o ' +
        'gravador do troféu em nenhum momento; ele trabalha sozinho nos bastidores.',
    },
    {
      suspectId: 'marcio-teles',
      name: 'Márcio Teles',
      role: 'Gravador de troféus',
      description:
        'Ourives contratado para gravar o nome do vencedor no troféu durante o evento, nos bastidores.',
      testimony:
        'Eu gravo o nome que me mandam. Às 19h10 encontrei na minha bancada um bilhete escrito à mão, sem ' +
        'assinatura, com o nome do vencedor. É sempre assim: a organização deixa o bilhete e eu gravo.',
    },
  ],
  evidences: [
    {
      evidenceId: 'ev-01',
      title: 'Planilha de notas do júri',
      content:
        'Planilha assinada pelos cinco jurados às 18h40: Irene Sato — 47 pontos; Paulo Rangel — 45 pontos; ' +
        'Caio Brandt — 41 pontos. Observação da presidente: "Resultado lacrado em envelope e entregue à ' +
        'organizadora Denise Couto às 18h45. Cópia da planilha mantida pelo júri."',
      requires: [],
    },
    {
      evidenceId: 'ev-02',
      title: 'Bilhete deixado na bancada do gravador',
      content:
        'Papel com o logotipo do concurso, escrito à mão com caneta azul: "Gravar: Paulo Rangel — 1º lugar". ' +
        'Sem assinatura. O mesmo bloco de papel é usado pela produção nos bastidores.',
      requires: [],
    },
    {
      evidenceId: 'ev-03',
      title: 'Gravação dos bastidores da TV',
      content:
        'A equipe de TV filmou sem cortes o camarim dos finalistas das 18h30 às 20h20. Paulo Rangel aparece ' +
        'durante todo o período, ora em entrevista, ora ao lado dos outros chefs. A câmera do corredor mostra ' +
        'Denise Couto entrando na área do gravador às 19h05 e saindo às 19h08 com um envelope na mão.',
      requires: [],
    },
    {
      evidenceId: 'ev-04',
      title: 'Exame grafotécnico do bilhete',
      content:
        'O perito comparou o bilhete com documentos escritos à mão por pessoas da produção. A inclinação, o ' +
        'traço do "R" maiúsculo e o espaçamento das letras coincidem com as anotações de Denise Couto no ' +
        'roteiro da cerimônia. Não há semelhança com a letra de Paulo Rangel nem com a de Márcio Teles.',
      requires: ['ev-02'],
    },
    {
      evidenceId: 'ev-05',
      title: 'Contrato de patrocínio',
      content:
        'Contrato entre a produção do concurso e o Grupo Rangel, assinado por Denise Couto: "Caso um chef do ' +
        'Grupo Rangel vença a edição deste ano, o patrocinador pagará à produtora um bônus de exposição de ' +
        'R$ 200 mil." Paulo Rangel não assina o contrato; quem assina pelo grupo é o diretor comercial.',
      requires: ['ev-04'],
    },
  ],
  hints: [
    {
      hintId: 'dica-1',
      text:
        'O nome gravado no troféu veio de algum lugar. Descubra de quem é a letra no papel que chegou ao ' +
        'gravador.',
      relatedEvidenceId: 'ev-02',
    },
    {
      hintId: 'dica-2',
      text:
        'Compare o que cada suspeito disse sobre onde estava entre 19h e 19h10 com o que as câmeras ' +
        'registraram.',
      relatedEvidenceId: 'ev-03',
    },
  ],
  solution: {
    culpritSuspectId: 'denise-couto',
    decisiveEvidenceId: 'ev-04',
    explanation:
      'Denise Couto sabotou a premiação. O júri deu a vitória a Irene Sato e entregou o envelope lacrado a ' +
      'Denise às 18h45. Às 19h05 ela entrou na área do gravador — embora tenha dito que nunca falou com ' +
      'ele — e saiu três minutos depois com um envelope na mão. Às 19h10, Márcio encontrou o bilhete ' +
      'mandando gravar o nome de Paulo Rangel. Como o envelope ficou com ela até a cerimônia, Denise ' +
      'também trocou o cartão lido pelo apresentador. A prova decisiva é o exame grafotécnico: a letra do bilhete ' +
      'é a de Denise, a mesma das anotações no roteiro da cerimônia. Paulo não poderia ter agido: a TV o ' +
      'filmou no camarim durante todo o período. Márcio apenas gravou o nome que recebeu. O motivo de ' +
      'Denise era o bônus de R$ 200 mil que o patrocinador pagaria à produtora se um chef do Grupo Rangel ' +
      'vencesse.',
  },
};
