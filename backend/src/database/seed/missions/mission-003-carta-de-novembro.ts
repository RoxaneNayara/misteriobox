import type { Mission } from '../../../models/mission.model';

export const missionCartaDeNovembro: Mission = {
  missionId: 'missao-003',
  order: 3,
  title: 'A Carta de Novembro',
  theme: 'Segredo de família',
  difficulty: 'DIFICIL',
  synopsis:
    'Após a morte de um empresário, uma carta antiga é encontrada em sua biblioteca. O documento sugere que ' +
    'um acontecimento ocorrido muitos anos antes foi cuidadosamente ocultado pela família. Cinco pessoas ' +
    'conhecem partes da história, mas seus relatos não coincidem. Reconstrua os acontecimentos para descobrir ' +
    'quem está escondendo a verdade.',
  story:
    'Afonso Albuquerque Leme, fundador da Tecelagem Albuquerque, morreu aos 91 anos, de causas naturais, em ' +
    '28 de outubro. Uma semana depois, em 5 de novembro, sua viúva encontrou dentro de um livro de poemas da ' +
    'biblioteca uma carta nunca enviada, datada de novembro de 1979. Naquele ano, um incêndio destruiu o ' +
    'galpão 3 da tecelagem, e o contramestre Severino Matos foi demitido e responsabilizado publicamente. ' +
    'A carta sugere que Afonso sabia de algo que nunca contou. Cinco pessoas conhecem partes dessa história. ' +
    'Uma delas está escondendo a verdade — e tentando apagar o que restou dela.',
  suspects: [
    {
      suspectId: 'beatriz-albuquerque',
      name: 'Beatriz Albuquerque',
      role: 'Filha mais velha e presidente da tecelagem',
      description: 'Tem 68 anos e assumiu a empresa há duas décadas. Em 1979 tinha 21 anos.',
      testimony:
        'Em novembro de 1979 eu estudava artes em Paris. Só voltei ao Brasil no Natal daquele ano. Sei do ' +
        'incêndio apenas pelo que meu pai contou.',
    },
    {
      suspectId: 'henrique-albuquerque',
      name: 'Henrique Albuquerque',
      role: 'Filho mais novo',
      description: 'Tem 62 anos e nunca trabalhou na tecelagem. Em 1979 tinha 15 anos.',
      testimony:
        'Eu estava no internato, em Campinas. Só soube do incêndio por telefone. Lembro que meu pai nunca ' +
        'mais foi o mesmo depois daquele ano.',
    },
    {
      suspectId: 'marta-albuquerque',
      name: 'Marta Albuquerque',
      role: 'Viúva de Afonso',
      description: 'Casou-se com Afonso em 1990. Foi quem encontrou a carta.',
      testimony:
        'Encontrei a carta no dia 5 de novembro, dentro de um livro de poemas. Mostrei para todos no jantar ' +
        'daquela noite e a deixei sobre a mesa da biblioteca. Só conheci a família em 1990.',
    },
    {
      suspectId: 'augusto-paiva',
      name: 'Dr. Augusto Paiva',
      role: 'Advogado da família',
      description:
        'Advogado da família Albuquerque há mais de cinquenta anos e amigo íntimo de Afonso.',
      testimony:
        'Em 1979 redigi a demissão de Severino Matos por ordem do Afonso. Ele não explicou o motivo e eu ' +
        'não perguntei. Estive na biblioteca no dia 8, com a senhora Rosa, buscando documentos do inventário.',
    },
    {
      suspectId: 'rosa-matos',
      name: 'Rosa Matos',
      role: 'Bibliotecária',
      description:
        'Filha de Severino Matos. Foi contratada por Afonso em agosto para catalogar a biblioteca da mansão.',
      testimony:
        'O senhor Afonso me contratou em agosto, sabendo de quem eu era filha. Nunca entendi o motivo. ' +
        'Por ordem dele, trabalho sempre acompanhada da governanta.',
    },
  ],
  evidences: [
    {
      evidenceId: 'ev-01',
      title: 'A Carta de Novembro',
      content:
        '"Rio de Janeiro, 14 de novembro de 1979. S., sei que não foi você quem deixou a lamparina acesa no ' +
        'galpão. Calei-me para proteger alguém do meu próprio sangue, que naquela noite fazia lá, escondido, ' +
        'aquilo que eu havia proibido. Perdoe a covardia de um pai. Um dia a verdade precisará ser contada. — A."',
      requires: [],
    },
    {
      evidenceId: 'ev-02',
      title: 'Recorte de jornal de 1979',
      content:
        'Jornal da Cidade, 11 de novembro de 1979: "Incêndio destrói galpão 3 da Tecelagem Albuquerque. O fogo ' +
        'começou por volta das 23h de ontem. Ninguém ficou ferido. A empresa atribui o incêndio a uma lamparina ' +
        'esquecida acesa pelo contramestre Severino Matos, que foi demitido."',
      requires: [],
    },
    {
      evidenceId: 'ev-03',
      title: 'Inventário da biblioteca',
      content:
        'Catálogo concluído por Rosa Matos em 20 de outubro: "Diário pessoal de A. A. Leme, ano de 1979 — ' +
        'completo, páginas numeradas." Conferência feita depois da descoberta da carta: faltam as páginas de ' +
        '9 a 13 de novembro, arrancadas recentemente — as bordas do rasgo estão limpas, sem nenhum amarelamento.',
      requires: [],
    },
    {
      evidenceId: 'ev-04',
      title: 'Caderno de chaves da biblioteca',
      content:
        'A governanta anota quem retira a chave da biblioteca. Desde 20 de outubro: Rosa Matos — dias úteis, ' +
        'das 9h às 17h, sempre acompanhada pela governanta. 05/11, 15h — Marta Albuquerque, acompanhada pela ' +
        'governanta. 06/11, das 21h40 às 23h10 — Beatriz Albuquerque, sozinha ("pediu para não ser ' +
        'incomodada"). 08/11, 10h — Dr. Augusto Paiva, acompanhado por Rosa Matos. Henrique Albuquerque não ' +
        'retirou a chave nenhuma vez.',
      requires: ['ev-03'],
    },
    {
      evidenceId: 'ev-05',
      title: 'Cinzas na lareira da biblioteca',
      content:
        'Na manhã de 07/11, a governanta encontrou papel queimado na lareira da biblioteca, que não era acesa ' +
        'havia meses. Entre as cinzas, fragmentos de papel pautado idêntico ao do diário. Trechos legíveis: ' +
        '"...10 de novembro...", "...as tintas no galpão...", "...voltou de Paris sem avisar ninguém...".',
      requires: ['ev-04'],
    },
    {
      evidenceId: 'ev-06',
      title: 'Passaporte antigo encontrado no escritório',
      content:
        'Passaporte emitido em 1978 em nome de Beatriz Albuquerque, guardado em uma gaveta trancada do ' +
        'escritório de Afonso. Carimbos: saída do Brasil em 02/09/1979; entrada no Brasil em 03/11/1979; nova ' +
        'saída em 18/11/1979; entrada no Brasil em 21/12/1979.',
      requires: ['ev-07', 'ev-08'],
    },
    {
      evidenceId: 'ev-07',
      title: 'Telas escondidas no sótão',
      content:
        'Seis telas a óleo enroladas, escondidas atrás de um baú no sótão. Algumas têm marcas de fuligem e ' +
        'bordas chamuscadas. No verso de todas há a mesma anotação a lápis: "Galpão 3 — nov. 1979". Nenhuma ' +
        'está assinada.',
      requires: [],
    },
    {
      evidenceId: 'ev-08',
      title: 'Laudo dos bombeiros de 1979',
      content:
        'O fogo começou junto à janela norte do galpão 3, onde foram encontrados latas de terebintina, tintas a ' +
        'óleo, pincéis e um cavalete — materiais que não fazem parte da produção têxtil. A lamparina de querosene ' +
        'estava caída ao lado do cavalete.',
      requires: ['ev-02'],
    },
    {
      evidenceId: 'ev-09',
      title: 'Folha de ponto de Severino Matos',
      content:
        'Dia 10/11/1979: entrada às 6h01, saída às 18h02. Anexo: declaração de cartório informando que Severino ' +
        'foi padrinho de um casamento celebrado às 20h daquela noite, em Niterói.',
      requires: ['ev-08'],
    },
    {
      evidenceId: 'ev-10',
      title: 'Registro do internato',
      content:
        'Livro de presença do Colégio Monte Verde, em Campinas, novembro de 1979: Henrique Albuquerque presente ' +
        'em todos os dias, inclusive no fim de semana de 10 e 11 de novembro, quando os alunos internos ' +
        'permaneceram no colégio.',
      requires: ['ev-01'],
    },
    {
      evidenceId: 'ev-11',
      title: 'Bilhete de Afonso ao advogado',
      content:
        'Bilhete manuscrito, arquivado pelo Dr. Augusto Paiva, datado de 12/11/1979: "Augusto, prepare hoje a ' +
        'demissão do Severino. Não me faça perguntas. Estou protegendo alguém que voltou para casa antes do que ' +
        'todos pensam."',
      requires: ['ev-09'],
    },
    {
      evidenceId: 'ev-12',
      title: 'Fotografia de aniversário de 1979',
      content:
        'Foto do álbum da família, com a legenda "Meus 45 anos — 8 de novembro de 1979". Aparecem Afonso, o ' +
        'Dr. Augusto e uma jovem com as mãos manchadas de tinta. O rosto da jovem foi recortado da foto com ' +
        'tesoura; o corte é recente.',
      requires: ['ev-10'],
    },
  ],
  hints: [
    {
      hintId: 'dica-1',
      text:
        'A carta fala de alguém "do mesmo sangue" de Afonso. Descubra quem da família realmente poderia estar ' +
        'perto do galpão em novembro de 1979.',
      relatedEvidenceId: 'ev-01',
    },
    {
      hintId: 'dica-2',
      text:
        'O laudo dos bombeiros encontrou no galpão objetos que nada têm a ver com tecidos. Procure na casa ' +
        'onde objetos parecidos foram guardados.',
      relatedEvidenceId: 'ev-08',
    },
    {
      hintId: 'dica-3',
      text:
        'Alguém tentou apagar o passado depois que a carta foi encontrada. Verifique quem teve oportunidade ' +
        'de agir sem testemunhas.',
      relatedEvidenceId: 'ev-04',
    },
  ],
  solution: {
    culpritSuspectId: 'beatriz-albuquerque',
    decisiveEvidenceId: 'ev-06',
    explanation:
      'Beatriz Albuquerque está escondendo a verdade. Em 1979, Afonso proibia a filha de seguir a carreira ' +
      'artística. Beatriz voltou de Paris em segredo no dia 3 de novembro e passou a pintar escondida no ' +
      'galpão 3. Na noite de 10 de novembro, deixou uma lamparina de querosene acesa ao lado do cavalete e dos ' +
      'solventes, e o fogo destruiu o galpão. Para protegê-la, Afonso culpou o contramestre Severino Matos, que ' +
      'havia saído às 18h02 e estava em um casamento em Niterói. Afonso guardou o passaporte da filha e as telas ' +
      'salvas do fogo, e escreveu a carta que nunca teve coragem de enviar. Antes de morrer, contratou Rosa, ' +
      'filha de Severino, para catalogar a biblioteca — talvez esperando que a verdade fosse encontrada. Quando ' +
      'Marta revelou a carta, em 5 de novembro, Beatriz entrou sozinha na biblioteca na noite seguinte, arrancou ' +
      'as páginas do diário de 9 a 13 de novembro, queimou-as na lareira e recortou o próprio rosto da ' +
      'fotografia de aniversário. Henrique estava no internato; Marta só conheceu a família em 1990; o Dr. ' +
      'Augusto apenas cumpriu ordens sem conhecer o motivo; Rosa nunca esteve sozinha na biblioteca. A prova ' +
      'decisiva é o passaporte: os carimbos mostram que Beatriz estava no Brasil de 3 a 18 de novembro de 1979, ' +
      'o que desmente seu depoimento e a coloca na cidade na noite do incêndio.',
  },
};
