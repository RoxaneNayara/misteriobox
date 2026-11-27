import type { Mission } from '../../../models/mission.model';

export const missionProtocoloZero: Mission = {
  missionId: 'missao-008',
  order: 8,
  title: 'Protocolo Zero',
  theme: 'Manipulação de evidências digitais',
  difficulty: 'DIFICIL',
  synopsis:
    'Os dados de uma pesquisa sigilosa vazaram para um concorrente. A investigação interna apontou um ' +
    'pesquisador júnior com base nos registros do sistema, e ele foi demitido. Mas os registros não ' +
    'batem com o mundo físico. Descubra quem manipulou as evidências digitais — e quem realmente roubou os dados.',
  story:
    'Laboratório Helix, Campinas. Na madrugada de 14 de setembro, 3,2 GB de arquivos do Projeto Íris — uma ' +
    'nova vacina veterinária — foram copiados do servidor de pesquisa. Às 5h50, um alerta disparou e a ' +
    'equipe de segurança executou o Protocolo Zero: isolou a rede, reiniciou os servidores e exportou os ' +
    'registros para a investigação. O relatório final, entregue em dois dias, apontou o pesquisador Igor ' +
    'Sá, que foi demitido. Em outubro, uma empresa concorrente registrou uma patente idêntica. Igor jura ' +
    'inocência. A diretoria contratou a agência para revisar o caso. Cinco pessoas estão no centro da ' +
    'história, e nem todos os registros dizem a verdade.',
  suspects: [
    {
      suspectId: 'igor-sa',
      name: 'Igor Sá',
      role: 'Pesquisador júnior (demitido)',
      description:
        'Trabalhava no Projeto Íris havia oito meses. Foi demitido por justa causa com base no relatório interno.',
      testimony:
        'Saí do laboratório às 19h do dia 13 e fui direto para casa. Nunca acessei o sistema de madrugada e ' +
        'não tenho VPN. Alguém usou o meu nome para encobrir o que fez.',
    },
    {
      suspectId: 'paula-mendonca',
      name: 'Paula Mendonça',
      role: 'Diretora científica',
      description:
        'Coordena o Projeto Íris. Em agosto, recebeu uma proposta de emprego da empresa concorrente.',
      testimony:
        'Recebi a proposta, sim, e recusei por escrito. Na noite do vazamento eu estava em Lisboa, num ' +
        'congresso. Tenho acesso ao Projeto Íris, mas nunca precisaria roubar o que eu mesma coordeno.',
    },
    {
      suspectId: 'leandro-faria',
      name: 'Leandro Faria',
      role: 'Analista de segurança da informação',
      description:
        'Administra o servidor de registros e executou o Protocolo Zero. Escreveu o relatório técnico do caso.',
      testimony:
        'Na madrugada eu estava em casa, dormindo. Só soube do incidente pelo alerta das 5h50 e executei o ' +
        'Protocolo Zero à risca. Os registros apontaram o Igor; eu apenas os exportei. Meu notebook nem ' +
        'acessa a rede de pesquisa.',
    },
    {
      suspectId: 'hugo-carvalho',
      name: 'Hugo Carvalho',
      role: 'Técnico de manutenção terceirizado',
      description:
        'Cuida da refrigeração do datacenter. Foi chamado de emergência na noite do vazamento.',
      testimony:
        'Fui chamado por causa de um alarme de temperatura no datacenter, no subsolo. Fiquei lá dentro o ' +
        'tempo todo e não tenho senha de nenhum sistema. Nem subi ao laboratório.',
    },
    {
      suspectId: 'tania-oliveira',
      name: 'Tânia Oliveira',
      role: 'Gerente de compliance',
      description:
        'Conduziu a investigação interna e assinou o relatório que levou à demissão de Igor.',
      testimony:
        'Assinei o relatório com base nos registros entregues pela segurança. Não tenho acesso técnico aos ' +
        'servidores. Se os registros estavam errados, fui enganada como todos.',
    },
  ],
  evidences: [
    {
      evidenceId: 'ev-01',
      title: 'Relatório interno do incidente',
      content:
        'Assinado por Tânia Oliveira com base no relatório técnico de Leandro Faria: "Às 02h13 de 14/09, a ' +
        'credencial de Igor Sá copiou 3,2 GB da pasta do Projeto Íris a partir da estação de trabalho IG-07, ' +
        'no laboratório do 3º andar. Fonte: registros exportados durante o Protocolo Zero, às 06h47."',
      requires: [],
    },
    {
      evidenceId: 'ev-02',
      title: 'Catracas biométricas do prédio',
      content:
        'Igor Sá saiu às 19h02 de 13/09 e não voltou. Entre 22h e 6h, a única pessoa que entrou no prédio ' +
        'foi Hugo Carvalho, das 01h40 às 03h05. Leandro Faria e Tânia Oliveira não entraram no prédio nesse ' +
        'período. Paula Mendonça não registra entrada desde 10/09.',
      requires: [],
    },
    {
      evidenceId: 'ev-03',
      title: 'Registro de conexões da VPN',
      content:
        'Nenhuma conexão das contas de Igor Sá ou de Paula Mendonça entre 13 e 14/09. Única sessão na ' +
        'madrugada: das 02h01 às 02h40, dispositivo "NB-LF-02", endereço interno atribuído 10.8.4.22. O ' +
        'certificado do dispositivo foi emitido pela equipe de segurança da informação.',
      requires: ['ev-02'],
    },
    {
      evidenceId: 'ev-04',
      title: 'Chamado de manutenção do datacenter',
      content:
        'Chamado aberto em 13/09, às 18h, por Leandro Faria: "alarme intermitente de temperatura, enviar ' +
        'técnico de madrugada". O técnico não encontrou defeito. A fechadura do datacenter registra Hugo ' +
        'Carvalho lá dentro das 01h45 às 02h58, sem saídas. O datacenter fica no subsolo; o laboratório, no ' +
        '3º andar.',
      requires: ['ev-02'],
    },
    {
      evidenceId: 'ev-05',
      title: 'Perícia da estação de trabalho IG-07',
      content:
        'O registro de energia da placa-mãe e o nobreak mostram a estação IG-07 desligada das 19h05 de 13/09 ' +
        'às 08h10 de 14/09. Nenhum acesso local foi possível às 02h13. O disco não contém nenhum vestígio da ' +
        'cópia de 3,2 GB.',
      requires: ['ev-01'],
    },
    {
      evidenceId: 'ev-06',
      title: 'Metadados dos registros exportados',
      content:
        'O arquivo de registros entregue ao compliance foi gerado às 06h47 pela conta administrativa ' +
        '"lfaria-adm". Ele tem 14 linhas a menos que a contagem automática do servidor às 06h01, e sua ' +
        'assinatura digital (hash) não confere com a da cópia arquivada automaticamente no mesmo horário.',
      requires: ['ev-05'],
    },
    {
      evidenceId: 'ev-07',
      title: 'Cópia de segurança imutável dos registros',
      content:
        'Cópia gravada às 06h01 em armazenamento que não permite edição. Linha original das 02h13: "cópia de ' +
        '3,2 GB da pasta Projeto Íris — conta de serviço svc-backup — origem 10.8.4.22". As linhas de 02h01 a ' +
        '02h40 que mencionam 10.8.4.22 foram as removidas do arquivo exportado; a menção à estação IG-07 e à ' +
        'credencial de Igor não existe na cópia imutável.',
      requires: ['ev-03', 'ev-06'],
    },
    {
      evidenceId: 'ev-08',
      title: 'Cofre de senhas e inventário de equipamentos',
      content:
        'A senha da conta de serviço svc-backup fica no cofre de senhas da segurança. Histórico de consultas ' +
        'em setembro: uma única retirada, às 23h50 de 13/09, pelo usuário "lfaria". Tânia Oliveira e Paula ' +
        'Mendonça não têm acesso ao cofre. Inventário de TI: o notebook corporativo NB-LF-02 foi entregue a ' +
        'Leandro Faria em março e nunca foi devolvido ou transferido.',
      requires: ['ev-03', 'ev-07'],
    },
    {
      evidenceId: 'ev-09',
      title: 'Mensagem interna de Leandro a Tânia',
      content:
        'Canal interno, 14/09, às 06h30: "Protocolo Zero concluído. As evidências apontam para o Igor Sá. ' +
        'Exporto os registros em seguida." A exportação só foi gerada às 06h47 — dezessete minutos depois.',
      requires: ['ev-06'],
    },
    {
      evidenceId: 'ev-10',
      title: 'Proposta do concorrente a Paula Mendonça',
      content:
        'E-mail de 5 de agosto oferecendo a Paula a diretoria de pesquisa da empresa concorrente. Resposta ' +
        'dela em 20 de agosto: "Agradeço, mas não tenho interesse." Inscrição confirmada no congresso de ' +
        'Lisboa, de 12 a 16 de setembro, com registro de presença em todas as sessões.',
      requires: [],
    },
    {
      evidenceId: 'ev-11',
      title: 'Movimentação financeira',
      content:
        'Quebra de sigilo autorizada pela Justiça: em 2 de outubro, Leandro Faria recebeu R$ 450 mil de uma ' +
        'consultoria aberta em agosto, cujo único cliente é a empresa concorrente. Nenhuma movimentação ' +
        'atípica nas contas de Igor Sá, Hugo Carvalho ou Paula Mendonça.',
      requires: ['ev-08'],
    },
    {
      evidenceId: 'ev-12',
      title: 'Histórico das regras de alerta',
      content:
        'O sistema de monitoramento tem uma regra que dispara um alarme imediato para qualquer cópia acima ' +
        'de 1 GB. Histórico de configuração: 02h04 de 14/09 — regra "exfiltração" desativada pela conta ' +
        '"lfaria-adm", com o comentário "falso positivo do backup"; 05h48 — regra reativada pela mesma conta. ' +
        'O alerta das 5h50 foi gerado pela reativação, que reprocessou o evento das 02h13.',
      requires: ['ev-06'],
    },
    {
      evidenceId: 'ev-13',
      title: 'Planilha reproduzida na patente do concorrente',
      content:
        'A patente registrada em outubro reproduz a tabela de resultados do lote 14 do Projeto Íris. Essa ' +
        'tabela foi gerada no servidor por uma rotina automática às 23h20 de 13/09 e nunca foi impressa nem ' +
        'enviada por e-mail. Quem a copiou teve acesso ao servidor depois das 23h20 daquela noite.',
      requires: [],
    },
  ],
  hints: [
    {
      hintId: 'dica-1',
      text:
        'O relatório diz que a cópia foi feita de dentro do laboratório. Confira quem realmente estava no ' +
        'prédio e se aquela estação poderia estar ligada.',
      relatedEvidenceId: 'ev-02',
    },
    {
      hintId: 'dica-2',
      text:
        'Registros exportados podem ser editados; cópias imutáveis, não. Compare as duas versões e procure ' +
        'o que foi apagado.',
      relatedEvidenceId: 'ev-06',
    },
    {
      hintId: 'dica-3',
      text: 'Um endereço de rede aparece em mais de um registro. Descubra a que dispositivo ele pertence.',
      relatedEvidenceId: 'ev-03',
    },
  ],
  solution: {
    culpritSuspectId: 'leandro-faria',
    decisiveEvidenceId: 'ev-08',
    explanation:
      'Leandro Faria roubou os dados e manipulou os registros. A tabela reproduzida na patente só existiu ' +
      'no servidor a partir das 23h20 de 13/09, o que situa o roubo naquela madrugada — e descarta um ' +
      'vazamento anterior por Paula, que estava em Lisboa desde o dia 12 e não tem sessão de VPN. Às ' +
      '23h50, Leandro retirou do cofre a senha da conta de serviço svc-backup. Às 02h01 conectou-se pela ' +
      'VPN com o dispositivo NB-LF-02, que recebeu o endereço 10.8.4.22; às 02h04 desativou a regra de ' +
      'alerta de exfiltração e, às 02h13, copiou os 3,2 GB do Projeto Íris. Às 05h48 reativou o ' +
      'alerta, o que gerou o aviso das 5h50 e lhe deu o controle do Protocolo Zero. Para ter um suspeito ' +
      'no prédio, ele mesmo abriu na véspera o chamado que levou Hugo ao datacenter de madrugada. Ao ' +
      'exportar os registros com a conta "lfaria-adm", apagou as 14 linhas com o endereço 10.8.4.22 e ' +
      'trocou a origem pela estação IG-07 e pela credencial de Igor — tanto que já acusava Igor às 06h30, ' +
      'antes de a exportação existir. As contradições são verificáveis: Igor saiu às 19h02 e não tem VPN; ' +
      'a IG-07 estava desligada; Hugo não saiu do datacenter, no subsolo. A cópia imutável, gravada às ' +
      '06h01, mostra que a cópia partiu de 10.8.4.22, endereço que a VPN atribuiu ao NB-LF-02. A prova ' +
      'decisiva é o cofre de senhas com o inventário de TI: só Leandro retirou a senha da svc-backup naquela ' +
      'noite, e o NB-LF-02 é o notebook dele — o que desmente seu depoimento de que estava dormindo e de ' +
      'que o notebook não acessa a rede de pesquisa. O pagamento de R$ 450 mil recebido em outubro ' +
      'confirma o motivo.',
  },
};
