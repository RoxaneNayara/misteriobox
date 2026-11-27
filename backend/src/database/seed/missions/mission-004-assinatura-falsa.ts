import type { Mission } from '../../../models/mission.model';

export const missionAssinaturaFalsa: Mission = {
  missionId: 'missao-004',
  order: 4,
  title: 'A Assinatura Falsa',
  theme: 'Fraude documental em leilão',
  difficulty: 'FACIL',
  synopsis:
    'Um relógio de bolso centenário foi vendido em leilão por um valor recorde graças a um certificado ' +
    'de autenticidade assinado por um perito renomado. Dias depois, o comprador descobre que o documento ' +
    'é falso. Três pessoas passaram pelo lote antes do pregão. Descubra quem falsificou o certificado.',
  story:
    'Casa de Leilões Viana, sábado, 21 de março. O lote 47 — um relógio de bolso de ouro de 1898, que teria ' +
    'pertencido a um barão do café — foi arrematado por R$ 380 mil, quase quatro vezes o valor estimado. ' +
    'O que fez o preço disparar foi o certificado de autenticidade anexado ao catálogo, assinado pelo perito ' +
    'Otávio Brandão, a maior autoridade em relojoaria antiga do país. Na segunda-feira, o comprador procurou ' +
    'a família do perito para agradecer e ouviu que aquilo era impossível. O relógio é antigo, mas nada ' +
    'prova que pertenceu ao barão — e o certificado é falso. Três pessoas lidaram com o lote antes do leilão: ' +
    'a dona da casa de leilões, o vendedor do relógio e o assistente de catalogação.',
  suspects: [
    {
      suspectId: 'gloria-viana',
      name: 'Glória Viana',
      role: 'Leiloeira e dona da casa de leilões',
      description:
        'Comanda a Casa Viana há vinte anos. Recebe 12% de comissão sobre o valor de cada lote vendido.',
      testimony:
        'De 11 a 15 de março eu estava em Lisboa, numa feira de antiguidades. Aprovei o catálogo por e-mail, ' +
        'confiando no certificado que o Tiago anexou. Jamais arriscaria o nome da casa por uma comissão.',
    },
    {
      suspectId: 'fernando-rocha',
      name: 'Fernando Rocha',
      role: 'Vendedor do relógio',
      description:
        'Herdou o relógio do avô e decidiu vendê-lo para pagar dívidas. Ficou com 88% do valor arrematado.',
      testimony:
        'Entreguei o relógio no dia 10 sem papel nenhum; meu avô só dizia que era "do barão". Dois dias ' +
        'depois, o assistente me ligou dizendo que tinha conseguido um certificado e que o lance mínimo ' +
        'poderia triplicar. Achei que era sorte.',
    },
    {
      suspectId: 'tiago-nunes',
      name: 'Tiago Nunes',
      role: 'Assistente de catalogação',
      description:
        'Prepara fotos, descrições e documentos dos lotes. Recebe um bônus fixo quando um leilão supera a meta.',
      testimony:
        'O senhor Fernando trouxe o certificado junto com o relógio, dentro de um envelope. Eu só ' +
        'digitalizei e anexei ao catálogo. Nem conheço o perito.',
    },
  ],
  evidences: [
    {
      evidenceId: 'ev-01',
      title: 'Certificado de autenticidade do lote 47',
      content:
        '"Atesto que o relógio de bolso Patek, nº de série 41.207, pertenceu ao Barão de Santa Luzia." ' +
        'Datado de 13 de março de 2026 e assinado por Otávio Brandão. Impresso em papel timbrado com o ' +
        'carimbo do perito. A assinatura tem traço firme e regular.',
      requires: [],
    },
    {
      evidenceId: 'ev-02',
      title: 'Nota de falecimento do perito',
      content:
        'Publicada pela Associação Brasileira de Relojoaria: "Lamentamos informar o falecimento do perito ' +
        'Otávio Brandão, ocorrido em 2 de março de 2026, aos 79 anos, após longa internação." A família ' +
        'confirma que ele não emitia laudos desde dezembro.',
      requires: [],
    },
    {
      evidenceId: 'ev-03',
      title: 'Recibo de entrada do lote',
      content:
        'Recibo da Casa Viana, 10 de março, 16h20: "Recebido de Fernando Rocha: relógio de bolso de ouro, ' +
        'nº 41.207, em estojo de couro. Documentação de autenticidade: NENHUMA." Assinado pelo vendedor e por ' +
        'quem recebeu o lote: Tiago Nunes.',
      requires: [],
    },
    {
      evidenceId: 'ev-04',
      title: 'Perícia do papel do certificado',
      content:
        'O papel timbrado foi impresso em impressora a laser, não em gráfica. Os micropontos de rastreamento ' +
        'deixados pela impressora identificam o número de série do equipamento: é a impressora da sala de ' +
        'catalogação da própria Casa Viana. O carimbo é uma imagem digital, não tinta.',
      requires: ['ev-01'],
    },
    {
      evidenceId: 'ev-05',
      title: 'Registros do computador e da portaria',
      content:
        'Computador da sala de catalogação: o arquivo "certificado_lote47.pdf" foi criado em 13/03, às 22h14, ' +
        'na sessão do usuário "tnunes", e impresso às 22h31. Portaria do prédio em 13/03: Tiago Nunes entrou ' +
        'às 21h50 e saiu às 23h05. Ninguém mais entrou no prédio depois das 19h.',
      requires: ['ev-04'],
    },
  ],
  hints: [
    {
      hintId: 'dica-1',
      text: 'Compare a data do certificado com o que se sabe sobre o perito que o assinou.',
      relatedEvidenceId: 'ev-02',
    },
    {
      hintId: 'dica-2',
      text:
        'Se o documento é falso, ele foi produzido em algum lugar. Descubra onde foi impresso e quem estava ' +
        'lá naquela noite.',
      relatedEvidenceId: 'ev-04',
    },
  ],
  solution: {
    culpritSuspectId: 'tiago-nunes',
    decisiveEvidenceId: 'ev-05',
    explanation:
      'Tiago Nunes falsificou o certificado. O perito Otávio Brandão morreu em 2 de março e não poderia ' +
      'ter assinado um documento datado de 13 de março. O recibo de entrada, assinado pelo próprio Tiago, ' +
      'registra que o relógio chegou sem nenhuma documentação — o que desmente a versão dele de que o ' +
      'vendedor trouxe o certificado e confirma o depoimento de Fernando. A perícia mostrou que o papel ' +
      'foi impresso na impressora da sala de catalogação da Casa Viana. A prova decisiva são os registros ' +
      'do computador e da portaria: o arquivo do certificado foi criado na sessão de Tiago às 22h14 de ' +
      '13 de março, quando ele era a única pessoa no prédio. Glória estava em Lisboa e apenas aprovou o ' +
      'catálogo; Fernando nunca teve acesso à sala de catalogação. O motivo de Tiago era o bônus pago ' +
      'quando o leilão supera a meta.',
  },
};
