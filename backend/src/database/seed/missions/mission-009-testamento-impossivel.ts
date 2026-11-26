import type { Mission } from '../../../models/mission.model';

export const missionTestamentoImpossivel: Mission = {
  missionId: 'missao-009',
  order: 9,
  title: 'O Testamento Impossível',
  theme: 'Fraude sucessória e falsificação',
  difficulty: 'DIFICIL',
  synopsis:
    'Após a morte de uma matriarca do café, surge um testamento que muda a partilha de toda a herança. As ' +
    'assinaturas parecem autênticas, mas na data do documento ela não conseguia sequer segurar uma caneta. ' +
    'Descubra como um testamento impossível foi produzido — e por quem.',
  story:
    'Fazenda Boa Esperança, sul de Minas. Dona Celeste Amaral morreu aos 81 anos, em 20 de julho. Seu ' +
    'testamento público de 2019 dividia a fazenda entre os dois filhos e deixava a casa da colônia para a ' +
    'cuidadora. Em 26 de julho, porém, o administrador da fazenda entregou ao advogado da família um ' +
    'testamento particular, datado de 15 de junho, que deixa tudo para o filho Márcio e nomeia o próprio ' +
    'administrador como gestor da fazenda por dez anos. O documento tem a assinatura de dona Celeste e de ' +
    'três testemunhas. A filha Regina contestou na Justiça. Cinco pessoas aparecem nessa história, e as ' +
    'assinaturas, por mais estranho que pareça, são verdadeiras.',
  suspects: [
    {
      suspectId: 'marcio-amaral',
      name: 'Márcio Amaral',
      role: 'Filho mais velho',
      description: 'Mora em Toronto há doze anos e é o principal beneficiário do novo testamento.',
      testimony:
        'Soube do testamento pelo advogado, quando cheguei para o enterro. Nunca pedi nada à minha mãe e não ' +
        'tenho interesse em administrar uma fazenda. Achei estranho, mas não vou recusar o que ela quis.',
    },
    {
      suspectId: 'regina-amaral',
      name: 'Regina Amaral',
      role: 'Filha mais nova',
      description:
        'Mora em Belo Horizonte e acompanhava as contas da fazenda à distância. Contestou o novo testamento.',
      testimony:
        'Esse testamento é falso. Minha mãe jamais deixaria a fazenda só para o Márcio, que nem mora no ' +
        'Brasil. Em julho eu tinha marcado uma auditoria nas contas da fazenda; ela sabia e concordava.',
    },
    {
      suspectId: 'fausto-lemos',
      name: 'Dr. Fausto Lemos',
      role: 'Médico da família e testemunha',
      description: 'Médico de dona Celeste há trinta anos. Sua assinatura aparece como testemunha.',
      testimony:
        'Não me lembro de ter assinado testamento nenhum. Ao longo dos anos assinei muitos papéis para a ' +
        'família: atestados, declarações, documentos do seguro. Reconheço a minha assinatura, mas não o texto.',
    },
    {
      suspectId: 'neide-prates',
      name: 'Neide Prates',
      role: 'Cuidadora e testemunha',
      description:
        'Cuidou de dona Celeste nos últimos seis anos. Sua assinatura também aparece como testemunha.',
      testimony:
        'No dia 15 de junho dona Celeste estava com o braço direito engessado e não conseguia nem segurar a ' +
        'xícara. Eu nunca assinaria um testamento naquele dia. E esse papel ainda tira de mim a casa que ela ' +
        'me prometeu.',
    },
    {
      suspectId: 'jorge-moura',
      name: 'Jorge Moura',
      role: 'Administrador da fazenda e testemunha',
      description:
        'Administra a fazenda há quinze anos. O novo testamento o nomeia gestor por dez anos, com 10% dos lucros.',
      testimony:
        'Encontrei o testamento em 25 de julho, na gaveta da escrivaninha dela, e entreguei ao advogado no ' +
        'dia seguinte. Em 15 de junho estávamos todos na sede da fazenda; foi ela quem pediu para assinarmos. ' +
        'A cláusula a meu respeito foi ideia dela.',
    },
  ],
  evidences: [
    {
      evidenceId: 'ev-01',
      title: 'O testamento particular de 15 de junho',
      content:
        'Três páginas impressas. Deixa a fazenda, a casa da colônia e as aplicações para Márcio Amaral. ' +
        'Cláusula 4: "Nomeio Jorge Moura gestor da fazenda por dez anos, com 10% dos lucros, dispensado de ' +
        'prestar contas aos herdeiros." Na página 3, as assinaturas de Celeste Amaral e das testemunhas Fausto ' +
        'Lemos, Neide Prates e Jorge Moura, alinhadas na parte de baixo da folha.',
      requires: [],
    },
    {
      evidenceId: 'ev-02',
      title: 'Testamento público de 2019',
      content:
        'Lavrado em cartório em 2019: a fazenda é dividida em partes iguais entre Márcio e Regina; a casa da ' +
        'colônia fica para a cuidadora Neide Prates. Jorge Moura não é mencionado. O documento continua ' +
        'válido, a menos que exista um testamento posterior autêntico.',
      requires: [],
    },
    {
      evidenceId: 'ev-03',
      title: 'Prontuário médico de dona Celeste',
      content:
        'Fratura do punho direito em 2 de junho, com gesso até 30 de junho. Paciente destra. Anotação da ' +
        'fisioterapia em 14 de junho: "Não consegue segurar talheres nem escrever; dependente para atividades ' +
        'manuais." Nenhuma alteração de lucidez.',
      requires: ['ev-01'],
    },
    {
      evidenceId: 'ev-04',
      title: 'Perícia grafotécnica das assinaturas',
      content:
        'As quatro assinaturas da página 3 são autênticas. A de dona Celeste tem traço firme, contínuo e sem ' +
        'tremor — incompatível com um punho imobilizado. O perito conclui: "A assinatura é verdadeira, mas ' +
        'dificilmente foi feita em junho."',
      requires: ['ev-03'],
    },
    {
      evidenceId: 'ev-05',
      title: 'Exame físico da página 3',
      content:
        'A página 3 é de um papel mais grosso (90 g) que as páginas 1 e 2 (75 g) e tem dois furos antigos de ' +
        'grampo que as outras não têm. No ponto em que o texto impresso cruza as assinaturas, o toner está ' +
        'por cima da tinta da caneta: as assinaturas foram feitas antes de o texto ser impresso. A impressão ' +
        'das três páginas tem a mesma falha em faixa da impressora do escritório da fazenda.',
      requires: ['ev-04'],
    },
    {
      evidenceId: 'ev-06',
      title: 'Processo da seguradora rural',
      content:
        'Arquivo da seguradora: "Termo de vistoria da safra", datado de 10 de maio, em papel de 90 g e ' +
        'grampeado. A segunda folha do termo contém apenas as assinaturas de Celeste Amaral, Fausto Lemos, ' +
        'Neide Prates e Jorge Moura, na parte de baixo, exatamente na mesma posição da página 3 do ' +
        'testamento; o resto da folha está em branco. Anotação do corretor: "Recebida ' +
        'apenas cópia digitalizada, enviada por Jorge Moura em 12/05. O original ficou com ele para envio pelo ' +
        'correio — nunca chegou."',
      requires: ['ev-05', 'ev-09'],
    },
    {
      evidenceId: 'ev-07',
      title: 'Passagem aérea e e-mail de Márcio',
      content:
        'Márcio desembarcou no Brasil em 22 de julho, dois dias após a morte da mãe; não viajava ao país desde ' +
        'dezembro. E-mail dele para Regina, em 18 de junho: "Não quero a fazenda. Quando chegar a hora, vamos ' +
        'vender e dividir. E vamos tirar o Jorge da gestão, as contas não fecham."',
      requires: [],
    },
    {
      evidenceId: 'ev-08',
      title: 'Inventário da escrivaninha',
      content:
        'Em 21 de julho, um dia após a morte, Regina e Neide esvaziaram a escrivaninha de dona Celeste, à ' +
        'procura de documentos para o velório e o inventário, e listaram tudo o que encontraram. A lista, ' +
        'assinada pelas duas e fotografada, termina com: "gaveta central — vazia". A escrivaninha ficou ' +
        'trancada; a chave reserva fica no escritório da administração.',
      requires: ['ev-01'],
    },
    {
      evidenceId: 'ev-09',
      title: 'Agenda do Dr. Fausto',
      content:
        'Agenda de 2026: "10/05 — Fazenda Boa Esperança. Vistoria do seguro da safra; assinei o termo com dona ' +
        'Celeste, a Neide e o Jorge." "14 a 16/06 — Congresso de Cardiologia, Porto Alegre." Comprovante de ' +
        'hospedagem em Porto Alegre de 13 a 16 de junho.',
      requires: ['ev-03'],
    },
    {
      evidenceId: 'ev-10',
      title: 'E-mail de Regina a Jorge',
      content:
        'Enviado em 10 de julho: "Jorge, a auditoria das contas da fazenda está marcada para 5 de agosto. ' +
        'Precisamos entender as diferenças nas vendas de café de 2025. Mamãe está de acordo." Jorge ' +
        'respondeu no mesmo dia: "Tudo será esclarecido."',
      requires: ['ev-08'],
    },
    {
      evidenceId: 'ev-11',
      title: 'Registro de entrega ao advogado',
      content:
        'Recibo do escritório de advocacia, 26 de julho: "Recebido de Jorge Moura um testamento particular ' +
        'de Celeste Amaral, datado de 15/06/2026, que, segundo o portador, estava na gaveta central da ' +
        'escrivaninha." Nenhuma das outras testemunhas sabia da existência do documento.',
      requires: ['ev-08'],
    },
  ],
  hints: [
    {
      hintId: 'dica-1',
      text:
        'As assinaturas são verdadeiras, mas dona Celeste não conseguia escrever em junho. Pense em quando ' +
        'elas podem ter sido feitas — e sobre qual papel.',
      relatedEvidenceId: 'ev-04',
    },
    {
      hintId: 'dica-2',
      text:
        'A página das assinaturas é diferente das outras. Procure outro documento que reuniu as mesmas quatro ' +
        'pessoas antes da fratura.',
      relatedEvidenceId: 'ev-05',
    },
    {
      hintId: 'dica-3',
      text:
        'Quem diz ter encontrado o testamento precisa explicar como ele foi parar numa gaveta que já estava ' +
        'vazia.',
      relatedEvidenceId: 'ev-08',
    },
  ],
  solution: {
    culpritSuspectId: 'jorge-moura',
    decisiveEvidenceId: 'ev-06',
    explanation:
      'Jorge Moura forjou o testamento. Em 10 de maio, antes da fratura, dona Celeste, o Dr. Fausto, Neide e ' +
      'Jorge assinaram o termo de vistoria do seguro da safra. Jorge enviou à seguradora só uma cópia ' +
      'digitalizada e ficou com o original. Quando Regina marcou para agosto a auditoria das contas da ' +
      'fazenda, ele separou a folha de assinaturas do termo, que tinha a parte de cima ' +
      'em branco, e imprimiu nela a página final de um testamento que o mantinha no comando da fazenda por dez anos e completou o documento com duas ' +
      'páginas novas, na impressora do escritório. Por isso o testamento é "impossível": as assinaturas são ' +
      'verdadeiras, mas foram feitas antes do texto — o toner está sobre a tinta —, em maio, quando dona ' +
      'Celeste ainda escrevia. Em 15 de junho ela estava engessada e o Dr. Fausto estava em Porto Alegre, o ' +
      'que desmente o depoimento de Jorge de que todos assinaram juntos naquele dia. A gaveta onde ele diz ' +
      'ter achado o documento estava vazia desde 21 de julho. Márcio estava no Canadá, queria vender a ' +
      'fazenda e afastar Jorge da gestão; Neide perderia a casa; Regina contestou o documento; Fausto só reconheceu a própria ' +
      'assinatura. A prova decisiva é o processo da seguradora: o termo de vistoria tem as quatro ' +
      'assinaturas na mesma posição da página 3, e o original ficou com Jorge e nunca foi entregue.',
  },
};
