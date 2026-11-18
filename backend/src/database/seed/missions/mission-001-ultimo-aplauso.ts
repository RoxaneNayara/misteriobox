import type { Mission } from '../../../models/mission.model';

export const missionUltimoAplauso: Mission = {
  missionId: 'missao-001',
  order: 1,
  title: 'O Último Aplauso',
  theme: 'Roubo em um teatro',
  difficulty: 'FACIL',
  synopsis:
    'Na noite de estreia de uma peça, um violino histórico desaparece de uma sala trancada do teatro. ' +
    'Um apagão de sete minutos interrompe o sistema de segurança. Três pessoas tinham acesso à sala, ' +
    'mas todas negam envolvimento. Analise os registros e depoimentos para descobrir quem roubou o instrumento.',
  story:
    'Teatro Imperial, noite de estreia da peça "O Último Aplauso". O violino Aurora, um instrumento de ' +
    '1780 emprestado por um museu, estava guardado na Sala dos Instrumentos e só seria tocado no ' +
    'encerramento, às 22h30. Às 21h40, durante o segundo ato, todo o teatro mergulhou na escuridão. ' +
    'A energia voltou às 21h47. Quando a diretora foi buscar o Aurora para o encerramento, o estojo ' +
    'estava vazio. Não houve arrombamento. Três pessoas tinham acesso àquela sala: a diretora do teatro, ' +
    'o músico principal e a chefe da segurança.',
  suspects: [
    {
      suspectId: 'helena-duarte',
      name: 'Helena Duarte',
      role: 'Diretora do teatro',
      description:
        'Dirige o Teatro Imperial há dez anos e negociou pessoalmente o empréstimo do Aurora com o museu.',
      testimony:
        'Eu estava no saguão, dando uma entrevista ao vivo para a rádio. Quando tudo apagou, pedi calma ' +
        'ao público pelo microfone da própria rádio. Depois que a luz voltou, fui com o eletricista até a ' +
        'sala de segurança entender o que tinha acontecido.',
    },
    {
      suspectId: 'ricardo-valenca',
      name: 'Ricardo Valença',
      role: 'Músico principal',
      description:
        'Violinista premiado, seria o responsável por tocar o Aurora no encerramento da estreia.',
      testimony:
        'Eu estava no palco, no meio do solo do segundo ato. Quando a luz caiu, continuei tocando de ' +
        'memória. Músico não abandona o palco no meio de uma peça. O Aurora só sairia da sala no encerramento.',
    },
    {
      suspectId: 'clara-monteiro',
      name: 'Clara Monteiro',
      role: 'Chefe da segurança',
      description:
        'Responsável pela equipe de segurança do teatro e pelo controle de acesso às áreas restritas.',
      testimony:
        'Quando as luzes apagaram, eu fazia a ronda no corredor dos camarins. Corri até a portaria para ' +
        'verificar as saídas de emergência e só fui à sala de segurança quando a energia já tinha voltado.',
    },
  ],
  evidences: [
    {
      evidenceId: 'ev-01',
      title: 'Relatório técnico do apagão',
      content:
        'Elaborado pelo eletricista de plantão: o apagão das 21h40 às 21h47 não foi causado por falha da ' +
        'concessionária. O disjuntor geral foi desligado manualmente e religado sete minutos depois. O ' +
        'quadro de energia fica dentro da sala de segurança, acessível apenas por crachá. Observação: as ' +
        'fechaduras eletrônicas do teatro, inclusive a da Sala dos Instrumentos, são do tipo "fail-safe" — ' +
        'destravam automaticamente quando falta energia, por norma de evacuação.',
      requires: [],
    },
    {
      evidenceId: 'ev-02',
      title: 'Programa da noite de estreia',
      content:
        '21h35 — Entrevista ao vivo da diretora Helena Duarte para a Rádio Cultura da Cidade, no saguão. ' +
        '21h38 — Segundo ato: solo "Noturno em Ré", por Ricardo Valença (12 minutos, com o violino de ' +
        'ensaio da orquestra). 22h30 — Encerramento: Ricardo Valença toca o violino histórico Aurora.',
      requires: [],
    },
    {
      evidenceId: 'ev-03',
      title: 'Gravação da transmissão da rádio',
      content:
        'A gravação registra, entre 21h38 e 21h50, o solo de violino sem nenhuma pausa — inclusive durante ' +
        'os sete minutos de escuridão, quando o público aplaude ao perceber que o músico continuou tocando. ' +
        'Às 21h43, o locutor diz: "A diretora Helena Duarte, aqui ao meu lado no saguão, pede calma ao ' +
        'público". A voz de Helena é ouvida logo em seguida.',
      requires: [],
    },
    {
      evidenceId: 'ev-04',
      title: 'Registro de crachás da sala de segurança',
      content:
        'O leitor de crachás da sala de segurança tem bateria própria e não foi afetado pelo apagão. ' +
        'Registros da noite: 21h38 — entrada de Clara Monteiro. 21h48 — saída de Clara Monteiro. ' +
        '21h52 — entrada de Helena Duarte, acompanhada do eletricista. Nenhum outro registro entre 19h e 23h.',
      requires: ['ev-01'],
    },
    {
      evidenceId: 'ev-05',
      title: 'Carrinho de lavanderia no depósito',
      content:
        'Na manhã seguinte, o violino Aurora foi encontrado embrulhado em uma toalha dentro de um carrinho ' +
        'de lavanderia, no depósito ao lado da sala de segurança. A empresa de lavanderia informou que ' +
        'recebeu, às 21h44, um pedido de recolhimento antecipado desse carrinho para as 6h, feito por ' +
        'telefone a partir do ramal da sala de segurança.',
      requires: ['ev-04'],
    },
  ],
  hints: [
    {
      hintId: 'dica-1',
      text:
        'Releia como as fechaduras do teatro se comportam quando falta energia: o apagão pode ter sido ' +
        'o próprio método do crime.',
      relatedEvidenceId: 'ev-01',
    },
    {
      hintId: 'dica-2',
      text:
        'Alguns registros do teatro não dependem da rede elétrica. Compare-os com o que cada suspeito ' +
        'disse sobre onde estava durante o apagão.',
      relatedEvidenceId: 'ev-04',
    },
  ],
  solution: {
    culpritSuspectId: 'clara-monteiro',
    decisiveEvidenceId: 'ev-04',
    explanation:
      'Clara Monteiro roubou o violino Aurora. Como chefe da segurança, ela sabia que as fechaduras ' +
      'eletrônicas do teatro destravam sozinhas quando falta energia. Às 21h38 entrou na sala de ' +
      'segurança, o único lugar onde fica o quadro de energia, e às 21h40 desligou o disjuntor geral. ' +
      'Com a Sala dos Instrumentos destrancada pelo apagão, retirou o violino e o escondeu em um carrinho ' +
      'de lavanderia, pedindo pelo ramal da sala de segurança, às 21h44, que ele fosse recolhido às 6h. ' +
      'Ricardo não poderia ter agido: a transmissão da rádio registra seu solo sem interrupção durante ' +
      'todo o apagão. Helena também não: a mesma transmissão a coloca ao vivo no saguão, e ela só entrou ' +
      'na sala de segurança às 21h52, depois que a energia voltou. A prova decisiva é o registro de ' +
      'crachás da sala de segurança, que funciona com bateria própria: ele mostra que apenas Clara ' +
      'esteve no local de onde o apagão foi provocado, desmentindo seu depoimento.',
  },
};
