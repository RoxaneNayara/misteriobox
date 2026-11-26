import type { Mission } from '../../../models/mission.model';

export const missionVotoDecisivo: Mission = {
  missionId: 'missao-007',
  order: 7,
  title: 'O Voto Decisivo',
  theme: 'Fraude em assembleia empresarial',
  difficulty: 'MEDIO',
  synopsis:
    'Uma fusão bilionária foi aprovada por uma diferença mínima de votos. O voto que decidiu a assembleia ' +
    'saiu da conta de uma acionista de 84 anos que estava internada e havia prometido votar contra. ' +
    'Descubra quem votou no lugar dela.',
  story:
    'Companhia Têxtil Vale Verde, assembleia extraordinária de 9 de junho. Em pauta, a fusão com o Grupo ' +
    'Atlas. A votação foi pela plataforma eletrônica da empresa, com senha e código enviado por SMS. ' +
    'Resultado: 50,6% a favor, 49,4% contra. O bloco que decidiu a votação — 3,2% das ações — pertence a ' +
    'dona Iolanda Reis, 84 anos, que estava internada naquela manhã e tinha dito a todos que votaria contra. ' +
    'O voto dela foi registrado como "SIM". Quatro pessoas tinham motivo ou meio para interferir.',
  suspects: [
    {
      suspectId: 'otto-bergamo',
      name: 'Otto Bergamo',
      role: 'Diretor-presidente da companhia',
      description:
        'Defendeu a fusão por dois anos. Receberá um bônus milionário se a operação for concluída.',
      testimony:
        'Eu presidi a assembleia do início ao fim, no palco, diante de duzentas pessoas. Não toquei em ' +
        'computador nem em celular. Queria a fusão, sim, mas venci no voto.',
    },
    {
      suspectId: 'silvia-kern',
      name: 'Sílvia Kern',
      role: 'Secretária da assembleia',
      description:
        'Administra a plataforma de votação e processa os pedidos de atualização de cadastro dos acionistas.',
      testimony:
        'Durante a votação eu estava na mesa de apuração, ao lado do auditor. Cadastros eu só altero com ' +
        'pedido formal e documento do acionista. Não tenho a senha de ninguém.',
    },
    {
      suspectId: 'daniela-freitas',
      name: 'Daniela Freitas',
      role: 'Advogada de dona Iolanda',
      description: 'Representa dona Iolanda há quinze anos e tinha procuração para votar por ela.',
      testimony:
        'Cheguei à assembleia às 10h40 para votar "NÃO" em nome da dona Iolanda, com a procuração. A mesa ' +
        'disse que o voto dela já tinha sido registrado pela plataforma. Fui a primeira a denunciar a fraude.',
    },
    {
      suspectId: 'renato-reis',
      name: 'Renato Reis',
      role: 'Neto de dona Iolanda',
      description:
        'Único neto e herdeiro de dona Iolanda. Trabalha como gerente comercial em São Paulo.',
      testimony:
        'Passei a manhã conversando com a minha avó no hospital. Ninguém mexeu no celular dela, que ficou o ' +
        'tempo todo na mesinha ao lado da cama. Eu não entendo nada dessa plataforma.',
    },
  ],
  evidences: [
    {
      evidenceId: 'ev-01',
      title: 'Ata da assembleia',
      content:
        'Votação aberta às 10h e encerrada às 10h35. A favor: 50,6%. Contra: 49,4%. Voto da acionista ' +
        'Iolanda Reis (3,2%): "SIM", registrado pela plataforma às 10h32, com confirmação por código SMS. ' +
        'Sem o voto dela, a fusão teria sido rejeitada.',
      requires: [],
    },
    {
      evidenceId: 'ev-02',
      title: 'Procuração de dona Iolanda',
      content:
        'Procuração assinada em 2 de junho: "Autorizo a Dra. Daniela Freitas a votar NÃO, em meu nome, na ' +
        'assembleia de 9 de junho." Pelo estatuto, a procuração só vale para voto presencial e perde o efeito ' +
        'se o próprio acionista votar antes pela plataforma.',
      requires: [],
    },
    {
      evidenceId: 'ev-03',
      title: 'Registro de acesso da plataforma de votação',
      content:
        'Conta de Iolanda Reis em 9/06: 09h58 — pedido de "esqueci minha senha"; link enviado ao e-mail ' +
        'cadastrado. 10h29 — nova senha criada. 10h31 — login a partir de uma rede de dados móveis. 10h32 — ' +
        'voto "SIM", confirmado pelo código SMS enviado ao celular cadastrado da acionista.',
      requires: ['ev-01'],
    },
    {
      evidenceId: 'ev-04',
      title: 'Histórico do cadastro da acionista',
      content:
        'Em 12 de maio, o e-mail cadastrado de Iolanda Reis foi trocado por um endereço novo, criado na mesma ' +
        'semana. O pedido foi aprovado por Sílvia Kern com base em um formulário com a assinatura da ' +
        'acionista e cópia do documento dela. Telefone de contato informado no formulário: o celular de ' +
        'Renato Reis.',
      requires: ['ev-03'],
    },
    {
      evidenceId: 'ev-05',
      title: 'Registro de visitas e pertences do hospital',
      content:
        'Hospital Santa Clara, 9/06. Visitante de Iolanda Reis: Renato Reis, das 9h30 às 10h45. Livro da ' +
        'enfermagem: "09h40 — celular da paciente entregue ao neto, a pedido dele, para carregar. Devolvido ' +
        'às 11h." A paciente dormiu sob sedação leve das 9h50 às 11h20.',
      requires: ['ev-03'],
    },
    {
      evidenceId: 'ev-06',
      title: 'Gravação da assembleia e da mesa de apuração',
      content:
        'A transmissão mostra Otto Bergamo no palco, sem celular ou computador, das 9h às 12h. Sílvia Kern ' +
        'aparece na mesa de apuração, ao lado do auditor externo, das 9h45 às 11h, sem se afastar. Daniela ' +
        'Freitas chega ao credenciamento às 10h38.',
      requires: [],
    },
    {
      evidenceId: 'ev-07',
      title: 'Mensagem do Grupo Atlas a Renato Reis',
      content:
        'E-mail de 20 de abril, enviado pelo diretor de expansão do Grupo Atlas a Renato Reis: "Concluída a ' +
        'fusão, a diretoria comercial da nova empresa é sua, como combinamos. Conto com a sua família."',
      requires: ['ev-05'],
    },
  ],
  hints: [
    {
      hintId: 'dica-1',
      text:
        'Um voto pela plataforma exige a senha e o código enviado ao celular da acionista. Descubra quem ' +
        'estava com cada um deles às 10h32.',
      relatedEvidenceId: 'ev-03',
    },
    {
      hintId: 'dica-2',
      text: 'Alguém preparou o terreno semanas antes. Veja quando e como o cadastro da acionista mudou.',
      relatedEvidenceId: 'ev-04',
    },
  ],
  solution: {
    culpritSuspectId: 'renato-reis',
    decisiveEvidenceId: 'ev-05',
    explanation:
      'Renato Reis votou no lugar da avó. Em maio, ele trocou o e-mail cadastrado de dona Iolanda por um ' +
      'endereço novo, usando um formulário com o próprio celular como contato. No dia da assembleia, pediu ' +
      'a redefinição da senha às 9h58, recebeu o link nesse e-mail e votou "SIM" às 10h32 por dados móveis. ' +
      'O código SMS só poderia ser lido por quem estivesse com o celular da acionista. A prova decisiva é o ' +
      'registro do hospital: das 9h40 às 11h o celular de dona Iolanda ficou com Renato, enquanto ela ' +
      'dormia sob sedação — o que desmente a versão de que o aparelho ficou na mesinha e de que os dois ' +
      'passaram a manhã conversando. Ele tinha tudo o que era preciso para votar. Otto estava no palco e Sílvia na mesa de apuração, ambos ' +
      'filmados; Sílvia aprovou a troca de e-mail de boa-fé, com documento da acionista. Daniela só chegou ' +
      'às 10h38, depois do voto. O motivo de Renato era a diretoria prometida pelo Grupo Atlas.',
  },
};
