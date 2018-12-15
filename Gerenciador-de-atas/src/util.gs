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

  var dicionario = {"P" : [],
                    "J" : [],
                    "F" : []
                   };

  // adiciona os moradores presentes na lista
  for (var i = 0; i < matrizChamada.length; i++){
    var status = matrizChamada[i][num_reuniao];
    if (["P", "J", "F"].indexOf(status) != -1) // se o status é conhecido
      dicionario[matrizChamada[i][num_reuniao]].push(moradores[i]);
  }

  for(var key in dicionario)
    dicionario[key].sort();

  return dicionario;
}

/**
* Retorna um JSON que representa um dicionário com os campos preenchidos no formulário
*/
function processarFormulario(formulario){
  var dicionario = {};
  dicionario["data"] = formulario.dia + 'T' + formulario.horario + ":00Z";
  dicionario["num_ata"] = formulario.num_ata;
  dicionario["num_votantes"] = formulario.num_votantes;
  dicionario["pautas"] = formulario.pautas.split(',').map(function(e){return e.trim();});
  dicionario["casa_reuniao"] = formulario.casa_reuniao;
  dicionario["nome_reuniao"] = formulario.nome_reuniao;
  dicionario["cargo_escritor"] = formulario.cargo_escritor;
  dicionario["cargo_coord"] = formulario.cargo_coord;
  dicionario["tipo_reuniao"] = formulario.tipo_reuniao;
  return JSON.stringify(dicionario);
}
