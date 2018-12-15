//////////////////// CONSTANTES /////////////////////
// ID das pastas e tabelas do drive
ID_ATA_PADRAO   = '1SMWUjTKH4JitW4MJfTBk7WwIKGQ0CJD3x6V527fiiF4';
ID_TABELA_AG    = '1Hz6fAYUrlzYna8tz1ItrxjXw9LCdw1twwUy76uuLMdw';
ID_TABELA_DE    = '1Wk18DIieOa8sFYetlb8V_makgopb6tPvJpKaf-Jc9-k';
ID_PASTA_AG     = '1M-BAw22jygdGtQqYSi9avj7TJN7uoNun';
ID_PASTA_DE     = '1LtZtXYgqXutlFf9wTV_VUVpBHp5URTWB';
ID_PASTA_ATAS   = '1CV5y-2oV-YZlYPc-ETR4ueCZ1VsPZaVs';
ID_PASTA_PADRAO = '1KuAl3DcnZLLT7uvVvm1svIrOkIPBDV5B';

// Parêmetros da estrutura da tabela de faltas
LINHA_INICIO_FALTAS  = 3; // Primeira linha após os cabeçalhos
LINHA_DATAS          = 2;
COLUNA_INICIO_FALTAS = 7; // Primeira coluna que inicia as informações
COLUNA_NOMES         = 2; // Coluna que contém os nomes na tabela

// Nome dos ocupantes dos cargos atuais
NOME_PRESIDENTE      = "Victor Girard Flores de Souza";
NOME_VICE_PRESIDENTE = "Carima Atyiel";
NOME_PRIM_SECRETARIO = "Laís Vieira Genro";
NOME_SEG_SECRETARIO  = "José Henrique da Silva Braz";

// Nome das reuniões
NOME_AG = 'Assembleia Geral'
NOME_DE = 'Diretoria Executiva'

// Nome dos cargos
CARGO_PRESIDENTE      = "Presidente";
CARGO_VICE_PRESIDENTE = "Vice Presidente";
CARGO_PRIM_SECRETARIO = "Primeiro Secretário";
CARGO_SEG_SECRETARIO  = "Segundo Secretário";

function doGet() {
  return HtmlService.createTemplateFromFile('Index').evaluate();
}

function gerarAta(json_formulario) {

  var formulario = JSON.parse(json_formulario);
  Logger.log(formulario);

  // Parametros:
  var casa_reuniao     = formulario["casa_reuniao"]; // número da casa que ocorreu a reunião
  var nome_reuniao     = formulario["nome_reuniao"];
  var tipo_reuniao     = formulario["tipo_reuniao"];
  var num_ata          = formulario["num_ata"];
  var lista_pautas     = formulario["pautas"];
  var cargo_escritor   = formulario["cargo_escritor"];
  var cargo_coord      = formulario["cargo_coord"];
  var data             = new Date(formulario["data"]);
  data.setTime(data.getTime() + data.getTimezoneOffset()*60*1000); // ajusta o fuso horário da data da reuniao
  var num_data         = [data.getYear(), data.getMonth()+1, data.getDate()].join('.');  // é a data da ata em forma de numero aaaa.mm.dd
  var num_ano          = data.getFullYear(); // número do ano da ata
  var hora_ata         = data.getHours().toString().extenso() + " horas e " + data.getMinutes().toString().extenso() + " minutos"; // hora do inicio da reunião
  var dia_ata          = data.getDate(); // numero do dia da ata
  var mes_ata          = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][data.getMonth()]; // mes da ata por extenso

  // Reconhece as pastas das atas
  var atas_pasta = DriveApp.getFolderById(ID_PASTA_ATAS);
  var padrao_pasta = DriveApp.getFolderById(ID_PASTA_PADRAO);
  var de_pasta = DriveApp.getFolderById(ID_PASTA_DE);
  var ag_pasta = DriveApp.getFolderById(ID_PASTA_AG);

  // Reconhece os arquivos das atas
  var ata_padrao = DriveApp.getFileById(ID_ATA_PADRAO);
  var tabela_ag = DriveApp.getFileById(ID_TABELA_AG);
  var tabela_de = DriveApp.getFileById(ID_TABELA_DE);

  ////////// Dicionários //////////////////
  var cargos = {};
  cargos[CARGO_PRIM_SECRETARIO] = NOME_PRIM_SECRETARIO;
  cargos[CARGO_SEG_SECRETARIO]  = NOME_SEG_SECRETARIO;
  cargos[CARGO_PRESIDENTE]      = NOME_PRESIDENTE;
  cargos[CARGO_VICE_PRESIDENTE] = NOME_VICE_PRESIDENTE;

  var reunioes_tabelas = {};    // dicionário que relaciona os tipos de reuniões com suas tabelas
  reunioes_tabelas[NOME_DE] = tabela_de;
  reunioes_tabelas[NOME_AG] = tabela_ag;

  var reunioes_pastas = {}; // dicionário que relaciona os tipos de reuniões com suas pastas
  reunioes_pastas[NOME_DE] = de_pasta;
  reunioes_pastas[NOME_AG] = ag_pasta;

  var membros_reuniao = {}; // o nome do grupo de membros que compoe a reuniao. ex: Assembleia Geral => CEUPA
  membros_reuniao[NOME_DE] = NOME_DE;
  membros_reuniao[NOME_AG] = "Casa Estudantil Universitária de Porto Alegre (CEUPA)";

  var ends_casas = {"I"   : "Rua Sarmento Leite, mil e cinquenta e três, bairro Cidade Baixa, em Porto Alegre",
  "II"  : "Rua José do Patrocínio, número seiscentos e quarenta e oito, em Porto Alegre",
  "III" : "Rua Luís Afonso, número trezentos e quarenta e sete, bairro Cidade Baixa, em Porto Alegre"};

  var dict_chamada = gerarDictChamada(data, reunioes_tabelas[nome_reuniao]);
  var presentes = dict_chamada["P"];
  var justificados = dict_chamada["J"];
  var num_votantes = formulario["num_votantes"];

  // Enunciados
  var enunciado_justificativas = ((justificados.length == 0) ? "Não houve justificativas" : "Os seguintes moradores justificaram ausência: ");
  var enunciado_pautas = ((lista_pautas.length > 1) ? "A reunião contou com os seguintes pontos de pauta" : "A reunião tinha como ponto de pauta único");

  var nome_escritor    = cargos[cargo_escritor];
  var nome_coord       = cargos[cargo_coord];

  // faz uma cópia da pasta padrao
  var nova_ata_doc = ata_padrao.makeCopy("Ata " + nome_reuniao + " " + num_data)

  // Cria uma pasta para a nova ata no local correto e move a nova ata para lá
  var nova_ata_pasta = DriveApp.createFolder(num_data);
  nova_ata_pasta.addFile(nova_ata_doc)
  padrao_pasta.removeFile(nova_ata_doc)
  reunioes_pastas[nome_reuniao].addFolder(nova_ata_pasta);  // coloca a ata criada na sua devida pasta
  DriveApp.removeFolder(nova_ata_pasta);  // Remove a pasta criada do root do drive

  // Dicionário que relaciona as marcações com as variáveis
  var patters = {
    "@NOMEREUNIAOTITULO" : nome_reuniao.toUpperCase(),
    "@TIPOREUNIAOMAIUSCULO" : tipo_reuniao.toUpperCase(),
    "@NUMATA" : num_ata,
    "@NUMANO" : num_ano,
    "@HORARIO" : hora_ata,
    "@DIA" : dia_ata.toString().extenso(),
    "@MES" : mes_ata,
    "@ANO" : num_ano.toString().extenso(),
    "@MEMBROSREUNIAO" : membros_reuniao[nome_reuniao],
    "@NUMCASA" : casa_reuniao,
    "@ENDCASA" : ends_casas[casa_reuniao],
    "@ENUNCIADOPAUTAS" : enunciado_pautas,
    "@ENUNCIADOJUSTIFICATIVAS" : enunciado_justificativas,
    "@PONTOSDEPAUTA" : lista_pautas.join(', '),
    "@PRESENTES" : presentes.join(', '),
    "@JUSTIFICADOS" : justificados.join(', '),
    "@NUMVOTANTES" : num_votantes.toString().extenso(),
    "@NOMEESCRITOR" : nome_escritor,
    "@NOMEREUNIAO" : nome_reuniao,
    "@CARGOESCRITORTITULO" : cargo_escritor.titlo(),
    "@CARGOESCRITOR" : cargo_escritor,
    "@NOMECOORDENADOR" : nome_coord,
    "@CARGOCOORDENADORTITULO" : cargo_coord.titlo(),
    "@CARGOCOORDENADOR" : cargo_coord
  };

  // Troca as aparições das marcações pelos seus respectivos valores
  var body = DocumentApp.openById(nova_ata_doc.getId()).getBody()
  for(var key in patters)
  body.replaceText(key, patters[key]);

  return nova_ata_doc.getUrl();
}
