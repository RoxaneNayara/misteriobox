import type { Mission } from '../../../models/mission.model';

export const missionQuarto307: Mission = {
  missionId: 'missao-002',
  order: 2,
  title: 'O Quarto 307',
  theme: 'Desaparecimento em um hotel',
  difficulty: 'MEDIO',
  synopsis:
    'Um hóspede desaparece misteriosamente de um hotel durante a madrugada. Seus pertences permanecem ' +
    'no quarto, mas os registros de entrada e saída apresentam inconsistências. Quatro pessoas podem estar ' +
    'envolvidas no desaparecimento. Relacione depoimentos, horários e evidências para descobrir o que aconteceu.',
  story:
    'Hotel Miramar Palace, sábado de manhã. O auditor Otávio Reis, contratado pelos proprietários do hotel ' +
    'para revisar as contas da gerência, não apareceu para o café. A camareira encontrou o quarto 307 com a ' +
    'cama intacta e todos os pertences do hóspede no lugar. O livro da portaria afirma que ele saiu pela ' +
    'porta principal durante a madrugada, mas ninguém o viu na rua. Na noite anterior, Otávio havia discutido ' +
    'no bar com outro hóspede. Quatro pessoas estiveram próximas dele nas últimas horas antes do sumiço.',
  suspects: [
    {
      suspectId: 'vitor-salgado',
      name: 'Vítor Salgado',
      role: 'Gerente geral do hotel',
      description:
        'Administra o Miramar Palace há doze anos. Elegante, metódico e conhecido por resolver tudo pessoalmente.',
      testimony:
        'Saí do hotel por volta das 23h e só voltei às 7h. Não tenho ideia de para onde foi o senhor Reis. ' +
        'Imagino que tenha saído para aproveitar a noite da cidade.',
    },
    {
      suspectId: 'lucia-prado',
      name: 'Lúcia Prado',
      role: 'Recepcionista do turno da noite',
      description:
        'Trabalha na recepção durante a madrugada há três anos e é responsável pelo livro de entradas e saídas.',
      testimony:
        'O hóspede do 307 passou pela recepção às 00h40 e saiu pela porta principal. Eu mesma anotei no ' +
        'livro. Não reparei em mais nada de diferente naquela noite.',
    },
    {
      suspectId: 'bernardo-kaiser',
      name: 'Bernardo Kaiser',
      role: 'Hóspede do quarto 309',
      description:
        'Empresário cuja empresa foi auditada por Otávio no ano passado. Discutiu com ele no bar do hotel ' +
        'na noite do desaparecimento.',
      testimony:
        'Discutimos no bar por volta das 21h, admito, mas depois fui dormir. Lá pela meia-noite e meia ' +
        'ouvi a porta do 307 e vi, pelo olho mágico, alguém de terno escuro entrando. Estava de costas.',
    },
    {
      suspectId: 'joana-ferraz',
      name: 'Joana Ferraz',
      role: 'Camareira do terceiro andar',
      description:
        'Responsável pela arrumação dos quartos do terceiro andar. Foi ela quem encontrou o quarto vazio.',
      testimony:
        'Meu turno terminou às 19h e fui para casa. Às 8h, quando voltei, encontrei o quarto 307 com todos ' +
        'os pertences do hóspede e a cama sem uso.',
    },
  ],
  evidences: [
    {
      evidenceId: 'ev-01',
      title: 'Registro da fechadura do quarto 307',
      content:
        '23h58 — porta aberta por dentro (saída do hóspede). 00h25 — porta aberta com o cartão mestre G-01. ' +
        '00h31 — porta aberta por dentro (saída). 08h00 — porta aberta com cartão de camareira. Nenhum outro ' +
        'acesso registrado.',
      requires: [],
    },
    {
      evidenceId: 'ev-02',
      title: 'Livro de entradas e saídas da portaria',
      content:
        'Anotação manuscrita de Lúcia Prado: "00h40 — Sr. Otávio Reis (307) saiu pela porta principal." ' +
        'A letra desta linha está visivelmente mais tremida que a das demais anotações da noite.',
      requires: [],
    },
    {
      evidenceId: 'ev-03',
      title: 'Câmera da porta principal',
      content:
        'A câmera que filma a porta principal funcionou normalmente a noite toda. A última pessoa a passar ' +
        'pela porta foi um casal de hóspedes, às 22h55. Entre 22h55 e 6h, ninguém entrou nem saiu por ali.',
      requires: ['ev-02'],
    },
    {
      evidenceId: 'ev-04',
      title: 'Registro telefônico da recepção',
      content:
        'Chamadas recebidas pela recepção durante a madrugada: 00h35 — ramal 101 (sala da gerência), ' +
        'duração de 2 minutos. Nenhuma outra chamada entre 23h e 6h.',
      requires: ['ev-03'],
    },
    {
      evidenceId: 'ev-05',
      title: 'Controle de cartões mestres',
      content:
        'G-01 — Gerência geral: cartão de uso pessoal de Vítor Salgado, que não pode ser emprestado. ' +
        'G-02 — Governança: passou a noite trancado no cofre (cofre fechado às 19h e aberto às 7h). ' +
        'Cartões de camareira: funcionam apenas das 7h às 19h.',
      requires: ['ev-01'],
    },
    {
      evidenceId: 'ev-06',
      title: 'Pertences no quarto 307',
      content:
        'Carteira, celular e notebook sobre a mesa. Na tela do notebook, um e-mail em rascunho: "Relatório ' +
        'final da auditoria — irregularidades graves nas contas da gerência. Envio amanhã às 9h, junto com a ' +
        'pasta de documentos originais." A pasta mencionada não está no quarto.',
      requires: [],
    },
    {
      evidenceId: 'ev-07',
      title: 'Registro do elevador de serviço',
      content:
        'O elevador de serviço só funciona com cartão. 00h02 — chamado no térreo, destino subsolo, cartão ' +
        'G-01. 00h20 — chamado no subsolo, destino 3º andar, cartão G-01. 00h33 — chamado no 3º andar, ' +
        'destino térreo, cartão G-01. No subsolo fica a antiga adega do hotel, desativada há anos.',
      requires: ['ev-05'],
    },
    {
      evidenceId: 'ev-08',
      title: 'Registro de chamadas do quarto 307',
      content:
        '23h50 — chamada recebida do ramal 101 (sala da gerência), duração de 3 minutos. Nenhuma outra ' +
        'chamada recebida ou feita naquela noite.',
      requires: ['ev-06'],
    },
  ],
  hints: [
    {
      hintId: 'dica-1',
      text:
        'Anotações feitas à mão podem ser escritas sob pressão. Confronte o livro da portaria com um ' +
        'registro automático da mesma porta.',
      relatedEvidenceId: 'ev-02',
    },
    {
      hintId: 'dica-2',
      text: 'Poucos cartões abrem qualquer porta do hotel. Descubra onde cada um deles estava durante a madrugada.',
      relatedEvidenceId: 'ev-05',
    },
    {
      hintId: 'dica-3',
      text:
        'Se o hóspede não saiu pela frente, ele continuou dentro do prédio. Procure registros de deslocamento ' +
        'entre os andares logo depois que ele deixou o quarto.',
      relatedEvidenceId: 'ev-01',
    },
  ],
  solution: {
    culpritSuspectId: 'vitor-salgado',
    decisiveEvidenceId: 'ev-07',
    explanation:
      'Vítor Salgado é o responsável pelo desaparecimento. Otávio Reis havia encontrado irregularidades nas ' +
      'contas da gerência e enviaria o relatório às 9h. Às 23h50, Vítor ligou do ramal 101 para o quarto 307 e ' +
      'chamou o auditor para uma conversa urgente. Às 00h02, usando seu cartão pessoal G-01, desceu com Otávio ' +
      'pelo elevador de serviço até o subsolo, com a desculpa de mostrar documentos antigos, e o trancou na ' +
      'adega desativada. Às 00h25 entrou no quarto 307 com o mesmo cartão e levou a pasta de documentos ' +
      'originais — foi ele o homem de terno visto por Bernardo. Às 00h35 ligou para a recepção e pressionou ' +
      'Lúcia Prado a registrar uma saída falsa às 00h40. A câmera da porta principal desmente tanto a anotação ' +
      'de Lúcia quanto o álibi de Vítor, que nunca saiu do hotel. Joana estava fora do turno e os cartões de ' +
      'camareira não funcionam de madrugada; o cartão G-02 passou a noite no cofre. Otávio foi encontrado ' +
      'ileso na adega ao meio-dia. A prova decisiva é o registro do elevador de serviço: o cartão pessoal de ' +
      'Vítor desceu ao subsolo minutos depois de o hóspede deixar o quarto.',
  },
};
