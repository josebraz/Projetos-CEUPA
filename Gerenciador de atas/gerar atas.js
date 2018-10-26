ID_ATA_PADRAO   = '1SMWUjTKH4JitW4MJfTBk7WwIKGQ0CJD3x6V527fiiF4';
ID_TABELA_AG    = '1Hz6fAYUrlzYna8tz1ItrxjXw9LCdw1twwUy76uuLMdw';
ID_TABELA_DE    = '1Wk18DIieOa8sFYetlb8V_makgopb6tPvJpKaf-Jc9-k';
ID_PASTA_AG     = '1M-BAw22jygdGtQqYSi9avj7TJN7uoNun';
ID_PASTA_DE     = '1LtZtXYgqXutlFf9wTV_VUVpBHp5URTWB';
ID_PASTA_ATAS   = '1CV5y-2oV-YZlYPc-ETR4ueCZ1VsPZaVs';
ID_PASTA_PADRAO = '1KuAl3DcnZLLT7uvVvm1svIrOkIPBDV5B';

LINHA_INICIO_FALTAS  = 3; // Primeira linha após os cabeçalhos
LINHA_DATAS          = 2; // Numero da linha que contém as datas
COLUNA_INICIO_FALTAS = 7; // Primeira coluna que inicia as informações
COLUNA_NOMES         = 2; // Coluna que contém os nomes na tabela

// Nome dos ocupantes dos cargos
NOME_PRESIDENTE      = "Victor Girard Flores de Souza";
NOME_VICE_PRESIDENTE = "Carima Atyiel";
NOME_PRIM_SECRETARIO = "Laís Vieira Genro";
NOME_SEG_SECRETARIO  = "José Henrique da Silva Braz";

/**
 * Converte um número para sua representação na forma extensa
 *
 * Desenvolvido por: Carlos R. L. Rodrigues
 */
String.prototype.extenso = function(c){
    var ex = [
        ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"],
        ["dez", "vinte", "trinta", "quarenta", "cinqüenta", "sessenta", "setenta", "oitenta", "noventa"],
        ["cem", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"],
        ["mil", "milhão", "bilhão", "trilhão", "quadrilhão", "quintilhão", "sextilhão", "setilhão", "octilhão", "nonilhão", "decilhão", "undecilhão", "dodecilhão", "tredecilhão", "quatrodecilhão", "quindecilhão", "sedecilhão", "septendecilhão", "octencilhão", "nonencilhão"]
    ];
    var a, n, v, i, n = this.replace(c ? /[^,\d]/g : /\D/g, "").split(","), e = " e ", $ = "real", d = "centavo", sl;
    for(var f = n.length - 1, l, j = -1, r = [], s = [], t = ""; ++j <= f; s = []){
        j && (n[j] = (("." + n[j]) * 1).toFixed(2).slice(2));
        if(!(a = (v = n[j]).slice((l = v.length) % 3).match(/\d{3}/g), v = l % 3 ? [v.slice(0, l % 3)] : [], v = a ? v.concat(a) : v).length) continue;
        for(a = -1, l = v.length; ++a < l; t = ""){
            if(!(i = v[a] * 1)) continue;
            i % 100 < 20 && (t += ex[0][i % 100]) ||
            i % 100 + 1 && (t += ex[1][(i % 100 / 10 >> 0) - 1] + (i % 10 ? e + ex[0][i % 10] : ""));
            s.push((i < 100 ? t : !(i % 100) ? ex[2][i == 100 ? 0 : i / 100 >> 0] : (ex[2][i / 100 >> 0] + e + t)) +
            ((t = l - a - 2) > -1 ? " " + (i > 1 && t > 0 ? ex[3][t].replace("ão", "ões") : ex[3][t]) : ""));
        }
        a = ((sl = s.length) > 1 ? (a = s.pop(), s.join(" ") + e + a) : s.join("") || ((!j && (n[j + 1] * 1 > 0) || r.length) ? "" : ex[0][0]));
        a && r.push(a + (c ? (" " + (v.join("") * 1 > 1 ? j ? d + "s" : (/0{6,}$/.test(n[0]) ? "de " : "") + $.replace("l", "is") : j ? d : $)) : ""));
    }
    return r.join(e);
}

/**
 * Transforma todas as primeiras letras em maiúsculas e o restante em minúsculas
 */
String.prototype.titlo = function(c){
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
}

/**
 * Obtem qual o número da reunião (índice) a partir da data informada
 */
function obterNumReuniao(data_reuniao, tabela_arquivo){
  var planilhaFaltas = SpreadsheetApp.open(tabela_arquivo);
  var datas_reunioes = planilhaFaltas.getActiveSheet()
                                     .getRange(LINHA_DATAS,
                                               COLUNA_INICIO_FALTAS,
                                               1, 
                                               planilhaFaltas.getLastColumn()-COLUNA_INICIO_FALTAS+1)
                                     .getDisplayValues()[0];
  
  dia  = data_reuniao.getDate().toString()
  diaF = (dia.length == 1) ? '0'+dia : dia
  mes  = (data_reuniao.getMonth()+1).toString()
  mesF = (mes.length == 1) ? '0'+mes : mes
  num_reuniao = datas_reunioes.indexOf(diaF + "/" + mesF);
  
  return num_reuniao;
}

/**
 * Retorna uma matriz da chamada em que as linhas são as pessoas e as colunas são as reuniões
 */
function obterMatrizChamada(tabela_arquivo){
  var planilhaFaltas = SpreadsheetApp.open(tabela_arquivo);
  var matrizChamada = planilhaFaltas.getActiveSheet()
                                    .getRange(LINHA_INICIO_FALTAS,
                                              COLUNA_INICIO_FALTAS,
                                              planilhaFaltas.getLastRow()-LINHA_INICIO_FALTAS+1, 
                                              planilhaFaltas.getLastColumn()-COLUNA_INICIO_FALTAS+1)
                                    .getDisplayValues();
  return matrizChamada;
}

/**
 * Retorna um vetor de todos os nomes dos moradores mencionados na tabela
 */
function obterNomeMoradores(tabela_arquivo){
  var planilhaFaltas = SpreadsheetApp.open(tabela_arquivo);
  var moradores = planilhaFaltas.getActiveSheet()
                                .getRange(LINHA_INICIO_FALTAS,
                                          COLUNA_NOMES,
                                          planilhaFaltas.getLastRow()-LINHA_INICIO_FALTAS+1)
                                .getDisplayValues();
  return moradores;
}

/**
 * Gera um dicionário com 3 chaves referenciando listas ordenadas de nomes de moradores que:
 *   -> P: Estavam presentes na reunião
 *   -> J: Justificaram suas faltas
 *   -> F: Faltaram a reunião
 */
function gerarDictChamada(data_reuniao, tabela_arquivo) {
  var matrizChamada = obterMatrizChamada(tabela_arquivo);
  var moradores = obterNomeMoradores(tabela_arquivo);
  var datas_reunioes = obterNumReuniao(data_reuniao, tabela_arquivo);
  
  var dict = {"P" : [],
              "J" : [],
              "F" : []};
  
  // adiciona os moradores presentes na lista
  for (var i = 0; i < matrizChamada.length; i++){
    var status = matrizChamada[i][num_reuniao];
    if (["P", "J", "F"].indexOf(status) != -1) // se o status é conhecido
      dict[matrizChamada[i][num_reuniao]].push(moradores[i])
  }
  
  // Ordena os nomes
  for(var key in dict) 
    dict[key].sort();
  
  return dict;
}

function main() {
  
  // Reconhece as pastas das atas
  var atas_pasta = DriveApp.getFolderById(ID_PASTA_ATAS);
  var padrao_pasta = DriveApp.getFolderById(ID_PASTA_PADRAO);
  var de_pasta = DriveApp.getFolderById(ID_PASTA_DE);
  var ag_pasta = DriveApp.getFolderById(ID_PASTA_AG);
  
  // Reconhece os arquivos das atas
  var ata_padrao = DriveApp.getFileById(ID_ATA_PADRAO);
  var tabela_ag = DriveApp.getFileById(ID_TABELA_AG);
  var tabela_de = DriveApp.getFileById(ID_TABELA_DE);
  
  // parametros:
  var minuto_reuniao = 30;
  var hora_reuniao   = 23;
  var dia_reuniao    = 19;
  var mes_reuniao    = 4;
  var ano_reuniao    = 2018;
  var num_ata = 0;   // numero da ata que aparece no inicio da mesma
  var num_casa = 'III'; // número da casa que ocorreu a reunião
  var nome_reuniao = 'Assembleia Geral';  
  var lista_pautas = ["bla", "blabla", "blablabla"];
  var nome_escritor = NOME_PRIM_SECRETARIO;
  var nome_coordenador = NOME_PRESIDENTE;   // Quem presidiu a reuniao
  var tipo_reuniao = "extraordinária"
  
  // ==================================================================================================
  // ==================================================================================================
  
  var data = new Date(ano_reuniao, mes_reuniao-1, dia_reuniao, hora_reuniao, minuto_reuniao); // ano, mes (0-11), dia, hora, minutos
  var num_data = [data.getYear(), data.getMonth()+1, data.getDate()].join('.');  // é a data da ata em forma de numero aa.mm.dd
  var num_ano = data.getFullYear(); // número do ano da ata
  var hora_ata = data.getHours().toString().extenso() + " horas e " + data.getMinutes().toString().extenso() + " minutos"; // hora do inicio da reunião
  var dia_ata = data.getDate(); // numero do dia da ata 
  var mes_ata = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"][data.getMonth()]; // mes da ata por extenso
  var enunciado_pautas = ((lista_pautas.length > 1) ? "A reunião contou com os seguintes pontos de pauta" : "A reunião tinha como ponto de pauta único");
  
  // Dicionários
  var reunioes_tabelas = {'Diretoria Executiva' : tabela_de,  // dicionário que relaciona os tipos de reuniões com suas tabelas
                          'Assembleia Geral'    : tabela_ag};
  var reunioes_pastas = {'Diretoria Executiva' : de_pasta,  // dicionário que relaciona os tipos de reuniões com suas pastas
                         'Assembleia Geral'    : ag_pasta};
  var ends_casas = {"I"   : "Rua Sarmento Leite, mil e cinquenta e três, bairro Cidade Baixa, em Porto Alegre",
                    "II"  : "Rua José do Patrocínio, número seiscentos e quarenta e oito, em Porto Alegre",
                    "III" : "Rua Luís Afonso, número trezentos e quarenta e sete, bairro Cidade Baixa, em Porto Alegre"};
  var cargos = {};
  cargos[NOME_PRIM_SECRETARIO] = "primeira secretária";
  cargos[NOME_SEG_SECRETARIO]  = "segundo secretário";
  cargos[NOME_PRESIDENTE]      = "presidente";
  cargos[NOME_VICE_PRESIDENTE] = "vice presidente";
  
  // Chamada
  var dict_chamada = gerarDictChamada(data, reunioes_tabelas[nome_reuniao]);
  var presentes = dict_chamada["P"];
  var justificados = dict_chamada["J"];
  var num_votantes = presentes.length;
  
  // faz uma cópia da pasta padrao
  var nova_ata_doc = ata_padrao.makeCopy("Ata " + nome_reuniao + " " + num_data)
  
  // Cria uma pasta para a nova ata no local correto e move a nova ata para lá
  var nova_ata_pasta = DriveApp.createFolder(num_data);
  nova_ata_pasta.addFile(nova_ata_doc)
  padrao_pasta.removeFile(nova_ata_doc)
  reunioes_pastas[nome_reuniao].addFolder(nova_ata_pasta);  // coloca a ata criada na sua devida pasta
  
  Logger.log(cargos);
  // Dicionário que relaciona as marcações com as variáveis
  var patters = {"@NOMEREUNIAOMAIUSCULO" : nome_reuniao.toUpperCase(),
                 "@TIPOREUNIAOMAIUSCULO" : tipo_reuniao.toUpperCase(),
                 "@NUMATA" : num_ata,
                 "@NUMANO" : num_ano,
                 "@HORARIO" : hora_ata,
                 "@DIA" : dia_ata.toString().extenso(),
                 "@MES" : mes_ata,
                 "@ANO" : num_ano.toString().extenso(),
                 "@NOMEREUNIAO" : nome_reuniao,
                 "@NUMCASA" : num_casa,
                 "@ENDCASA" : ends_casas[num_casa],
                 "@ENUNCIADOPAUTAS" : enunciado_pautas,
                 "@PONTOSDEPAUTA" : lista_pautas.join(', '),
                 "@PRESENTES" : presentes.join(', '),
                 "@JUSTIFICADOS" : justificados.join(', '),
                 "@NUMVOTANTES" : num_votantes.toString().extenso(),
                 "@NOMEESCRITOR" : nome_escritor,
                 "@CARGOESCRITORTITULO" : cargos[nome_escritor].titlo(),
                 "@CARGOESCRITOR" : cargos[nome_escritor],
                 "@NOMECOORDENADOR" : nome_coordenador,
                 "@CARGOCOORDENADORTITULO" : cargos[nome_coordenador].titlo(),
                 "@CARGOCOORDENADOR" : cargos[nome_coordenador]};
  
  // Troca as aparições das marcações pelos seus respectivos valores
  var body = DocumentApp.openById(nova_ata_doc.getId()).getBody()
  for(var key in patters) 
    body.replaceText(key, patters[key]); 
  
}

