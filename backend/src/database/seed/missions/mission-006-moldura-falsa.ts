import type { Mission } from '../../../models/mission.model';

export const missionMolduraFalsa: Mission = {
  missionId: 'missao-006',
  order: 6,
  title: 'A Moldura Falsa',
  theme: 'Substituição de obra de arte',
  difficulty: 'MEDIO',
  synopsis:
    'Uma pintura modernista voltou do restauro e foi pendurada de novo na galeria. Semanas depois, uma ' +
    'pesquisadora percebe que a tela é uma cópia — e que até a moldura é falsa. A obra passou por várias ' +
    'mãos entre o ateliê e a parede. Reconstrua o trajeto para descobrir quem fez a troca.',
  story:
    'Galeria Solano, Rio de Janeiro. A tela "Mulher à Janela", pintada por Elisa Varela em 1932 e emprestada ' +
    'pela Fundação Varela, foi enviada para restauro em 3 de maio. Voltou em 28 de maio e foi pendurada no ' +
    'salão principal no dia seguinte. Em 19 de junho, uma pesquisadora da fundação examinou a obra de perto ' +
    'e chamou a direção: a pintura é uma cópia muito bem-feita, e a moldura antiga, com o selo de cera da ' +
    'exposição de 1932, também foi substituída por uma imitação. Quatro pessoas lidaram com a obra nesse ' +
    'período: o dono da galeria, a restauradora, o responsável pelo transporte e a curadora assistente.',
  suspects: [
    {
      suspectId: 'arnaldo-solano',
      name: 'Arnaldo Solano',
      role: 'Dono da galeria',
      description:
        'Herdou a galeria do pai. Enfrenta dívidas desde a pandemia e negociou pessoalmente o empréstimo da obra.',
      testimony:
        'A galeria está em dificuldades, não nego. Mas a obra não é minha: se ela some, quem perde é a ' +
        'fundação, e eu perco a confiança de todos os acervos do país. Não tenho nada a ganhar com isso.',
    },
    {
      suspectId: 'vera-lins',
      name: 'Vera Lins',
      role: 'Restauradora',
      description:
        'Restauradora independente. Ficou com a obra por quase um mês no próprio ateliê, em Santa Teresa.',
      testimony:
        'A obra saiu do meu ateliê exatamente como entrou, só que limpa. Fotografei tudo na chegada e na ' +
        'saída, como faço com qualquer peça. Se trocaram a tela, não foi enquanto ela estava comigo.',
    },
    {
      suspectId: 'caio-mendes',
      name: 'Caio Mendes',
      role: 'Responsável pelo transporte',
      description:
        'Dono da transportadora especializada em arte que levou a obra de volta à galeria.',
      testimony:
        'Embalei a obra no ateliê, lacrei a caixa e levei direto para a galeria. Não parei em lugar nenhum. ' +
        'A curadora conferiu o lacre na chegada e assinou a guia.',
    },
    {
      suspectId: 'julia-neves',
      name: 'Júlia Neves',
      role: 'Curadora assistente',
      description:
        'Trabalha na galeria há três anos e cuida da reserva técnica, onde as obras ficam antes da montagem.',
      testimony:
        'Recebi a caixa às 15h05 e a guardei na reserva técnica até a montagem, na manhã seguinte. Nunca ' +
        'fiquei sozinha com a obra fora do horário. Desconfio do transporte: é o único trecho sem fotos.',
    },
  ],
  evidences: [
    {
      evidenceId: 'ev-01',
      title: 'Laudo da pesquisadora da fundação',
      content:
        'A tela pendurada no salão foi pintada com tinta acrílica, que só passou a ser vendida para artistas ' +
        'décadas depois de 1932. A moldura imita a original, mas o selo de cera da exposição de 1932 é de ' +
        'resina moldada. Conclusão: cópia recente, feita a partir de fotografias de alta resolução.',
      requires: [],
    },
    {
      evidenceId: 'ev-02',
      title: 'Ficha de restauro de Vera Lins',
      content:
        'Fotos de entrada (3/05) e de saída (28/05, 14h) mostram a mesma obra: craquelado em forma de estrela ' +
        'no canto inferior direito, assinatura "E. Varela 32" e selo de cera original no verso da moldura. ' +
        'Na cópia pendurada na galeria, o craquelado em estrela não existe — a superfície é lisa.',
      requires: [],
    },
    {
      evidenceId: 'ev-03',
      title: 'Guia de transporte e rastreador do caminhão',
      content:
        'Saída do ateliê às 14h20, chegada à galeria às 15h05, sem nenhuma parada no trajeto. Caixa lacrada ' +
        'com o lacre numerado 4471. Na guia, a curadora Júlia Neves anotou e assinou às 15h05: "lacre 4471 ' +
        'conferido, intacto".',
      requires: ['ev-02'],
    },
    {
      evidenceId: 'ev-04',
      title: 'Câmeras da reserva técnica',
      content:
        'A câmera da reserva técnica ficou desligada das 19h de 28/05 às 7h de 29/05. Motivo registrado no ' +
        'sistema: "manutenção programada". A solicitação foi aberta em 27/05 pelo login "jneves". O controle ' +
        'de acesso registra a entrada de Júlia Neves na reserva técnica às 20h12 de 28/05 e a saída às 21h40.',
      requires: ['ev-03'],
    },
    {
      evidenceId: 'ev-05',
      title: 'Etiqueta escondida na moldura falsa',
      content:
        'Ao desmontar a moldura falsa, o perito encontrou, presa por dentro do chassi, uma etiqueta do ateliê ' +
        'de molduras Ponto Fino: "Pedido 2210 — 14/02 — réplica patinada, 62 × 81 cm, selo de cera em resina".',
      requires: ['ev-01'],
    },
    {
      evidenceId: 'ev-06',
      title: 'Ficha do pedido 2210 do ateliê Ponto Fino',
      content:
        'Pedido feito em 14 de fevereiro, quase três meses antes do restauro, por "J. Neves". Pagamento com ' +
        'cartão de crédito em nome de Júlia Neves. Retirada em 20 de maio. Medidas e fotos de referência ' +
        'enviadas por e-mail pela cliente: as mesmas fotos de alta resolução do catálogo da galeria.',
      requires: ['ev-05'],
    },
    {
      evidenceId: 'ev-07',
      title: 'Contrato de empréstimo e apólice de seguro',
      content:
        'A obra pertence à Fundação Varela. O seguro, contratado pela fundação, indeniza exclusivamente a ' +
        'própria fundação em caso de perda, furto ou dano. A galeria não recebe nenhum valor e, pelo ' +
        'contrato, pagaria multa se a obra fosse perdida sob sua guarda.',
      requires: [],
    },
  ],
  hints: [
    {
      hintId: 'dica-1',
      text:
        'As fotos do restauro mostram um detalhe que a cópia não tem. Use-as para descobrir em que trecho do ' +
        'trajeto a obra verdadeira ainda existia.',
      relatedEvidenceId: 'ev-02',
    },
    {
      hintId: 'dica-2',
      text:
        'Uma cópia tão perfeita não se faz em uma noite. A moldura falsa pode revelar quando e por quem ela ' +
        'foi encomendada.',
      relatedEvidenceId: 'ev-05',
    },
    {
      hintId: 'dica-3',
      text: 'Verifique quem ganharia — ou perderia — dinheiro com o desaparecimento da obra.',
      relatedEvidenceId: 'ev-07',
    },
  ],
  solution: {
    culpritSuspectId: 'julia-neves',
    decisiveEvidenceId: 'ev-06',
    explanation:
      'Júlia Neves substituiu a obra. As fotos de saída do restauro mostram que a tela verdadeira, com o ' +
      'craquelado em estrela, deixou o ateliê de Vera às 14h de 28 de maio. O caminhão de Caio não fez ' +
      'paradas, e a própria Júlia conferiu e assinou que o lacre 4471 chegou intacto — o que desmonta a ' +
      'suspeita que ela tentou lançar sobre o transporte. A troca aconteceu depois da chegada: Júlia pediu ' +
      'o desligamento da câmera da reserva técnica um dia antes e entrou lá sozinha às 20h12, embora tenha ' +
      'dito que nunca ficou sozinha com a obra fora do horário. A prova decisiva é o pedido 2210 do ateliê ' +
      'Ponto Fino: a moldura falsa foi encomendada e paga por Júlia em fevereiro, quase três meses antes do ' +
      'restauro, com as fotos do catálogo da galeria. Arnaldo não ganharia nada — o seguro paga apenas à ' +
      'fundação e a galeria ainda sofreria multa.',
  },
};
