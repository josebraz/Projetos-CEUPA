# Gerador de Atas

### Introdução
Projeto destinado a automatizar a geração de atas da CEUPA o máximo possível.
São usadas uma série de ferramentas do Google: Docs, Sheet, Drive, e, claro, Google Script.
O intúito é proporcionar uma forma de, com a menor quantidade de informação fornecida pelo secretário,
gerar uma ata que contém as informações iniciais e final da reunião, partindo do princípio que sempre
essas partes seguem basicamente um padrão.


### Como usar
O repositório no `Google Drive` deve estar em um formato padrão (como o apresentado neste repositório).
cada pasta, referente a determinada reunião, contém outras pastas nomeadas com as datas no formato
americano `aaaa.mm.dd` e dentro destas estão os documentos correspondentes a ata em questão.

É preciso também possuir uma tabela do `Google Sheet` para cada tipo de reunião, como apresentado neste
repositório, é de lá que são coletados as informações das presenças e justificativas de cada reunião.
Obviamente, o secretário deve preencher essa tabela antes de rodar o script.

Há uma pasta especial chama de `Padrao`, nela estão os arquivos que são usados no script para gerar 
a nova ata. Atualmente só há um arquivo, a ata padrao que contém o modelo de como a ata vai se paracer
e seu texto pronto para substituição. A pasta está disponibilizada no repositório também, só é preciso 
copiar para seu repositório no `Google Drive`.

Tendo todo o sistema de pastas pronto, é preciso instalar o script no seu repositório do `Google Drive`.
Pode fazê-lo seguindo [este tutorial](https://developers.google.com/apps-script/overview). 
Pode apenas colar o texto do código `gerar atas.js` nesse novo script criado.


### Configurando o script para o seu repositório
O código disponibilizado está escrito em Javascript e não possui ainda (talvez nunca vá possuir) 
interface gráfica. Logo, para fornecer os parâmetros, deve-se editar as linhas correspondentes na função
`main` após o comentário `// Paramentros`. Tentei deixar o mais intuitivo o nome dessas variáveis.
O restante do código pode ser ignorado, a não ser se você for muito nerd.

É importante que a data informada bata com a informada na tabela de chamada, para que o programa consiga
capturar as informações corretamente.

É preciso também mudar o ID dos documentos (são as constantes nas primeiras linhas do programa).
Para obter o ID dos seus documentos, é preciso acessar documento e, na barra de endereços do navegador,
pegar o ID que está entre `d/` e `/edit`. Por exemplo, para o link: 
`https://docs.google.com/document/d/1SMWUjTKH4JitW4MJfTBk7WwIKGQ0CJD3x6V527fiiF4/edit` o ID é 
`1SMWUjTKH4JitW4MJfTBk7WwIKGQ0CJD3x6V527fiiF4`. o mesmo vale para pastas no `Google Drive`.
O ID informada deve ser referente a pasta ou arquivo coerentes no seu repositório. Por exemplo 
`ID_PASTA_AG` é o ID da pasta que contém as atas de Assembleia geral.

### Funcionamento Interno (para nerds)
Ainda em construção
