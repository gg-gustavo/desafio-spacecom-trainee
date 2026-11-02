# Desafio Spacecom Trainee Tech 2027: Detecção de Encontros

Solução em TypeScript (Node.js) para o desafio técnico de primeira etapa do Programa Trainee Tech da Spacecom. O problema pede um algoritmo que processa dados de geolocalização e detecta encontros físicos abaixo de 20 metros entre pessoas monitoradas, respeitando três classes de encontro e comparando apenas posicionamentos com o mesmo timestamp.

Minha solução processou os sete datasets oficiais numa soma de aproximadamente 35,6 segundos, com o maior deles (638 MB de CSV) em cerca de 20 segundos, e reproduziu os dois gabaritos oficiais de validação byte a byte, inclusive os doubles de `distanciaMetros`.

## O problema

A entrada é um CSV separado por ponto e vírgula com uma linha por posicionamento:

```
idMonitorado;faccaoMonitorado;timestamp;latitude;longitude;medidaProtetiva;idsRestricaoMedida
```

Os encontros a detectar, sempre com distância estritamente menor que 20 metros, usando a Fórmula de Haversine com raio da Terra de 6.371.000 metros, e registrados no máximo uma vez por par e por timestamp:

- `generico`: encontro entre quaisquer dois monitorados.
- `faccao`: encontro entre dois monitorados da mesma facção.
- `protetiva`: encontro entre um agressor e a respectiva vítima, quando o id do primeiro consta na restrição da segunda.

O score da avaliação é `soma_ec - soma_ei`: encontros corretos somam, falsos positivos descontam. Recall sem precisão não serve. Isso orientou todas as decisões abaixo.

## A solução

Três restrições definiram a arquitetura: a comparação precisa ocorrer apenas entre timestamps idênticos, os arquivos chegam a 638 MB e cada descoberta de par só vale uma vez. Processar tudo em memória ou fazer busca binária entre todos os pontos por janela não escala.

O pipeline tem cinco etapas:

1. **Leitura em fluxo.** O arquivo é lido linha a linha com o `readline` do Node. Nada do dataset inteiro fica em memória, só a janela corrente.
2. **Parser de campos.** Um parser dedicado consome o CSV respeitando aspas e campos vazios e lê o timestamp como string. Formatos `YYYY-MM-DD HH:MM:SS` com largura fixa comparados como string evitam parse de data e qualquer efeito de fuso ou milissegundo.
3. **Agrupamento por timestamp.** Posicionamentos da mesma janela de 5 segundos acumulam num buffer; ao mudar o timestamp ele é processado e liberado. A memória fica proporcional a uma janela, não ao arquivo.
4. **Poda espacial.** Dentro da janela, cada ponto entra numa célula de um grid de 25 metros com projeção uniforme. Um par abaixo de 20 metros só pode ocorrer na mesma célula ou em células vizinhas, então só esses casos testam a distância. Isso reduz a checagem de Haversine de O(n²) para próximo de O(n). A correção de longitude considera o fator cos na latitude máxima da janela, então as células continuam sensatas em latitudes altas.
5. **Haversine e dedupe.** Pares sobreviventes à poda recebem Haversine com R = 6371000 e são filtrados na condição estrita de menos de 20 metros. A chave `min(id):max(id)` junto do timestamp garante unicidade de registro. A classificação em `protetiva`, `faccao` e `generico` segue do mais específico para o mais geral, e cada tipo tem seu arquivo distinto.

Todo contador mantém ordem ascendente dos ids e as posições relatadas são exatamente as lidas do CSV, sem reformatar os cinco decimais.

## Detalhe que decidiu a precisão

A pontuação em double do Haversine precisa reproduzir os gabaritos. Uma primeira versão pré-calculava o fator de conversão grau radiano em variável, e o resultado diferia no último dígito de uma distância do dataset2. A fórmula reescrita com `(delta * Math.PI) / 180` e `Math.sin(...) ** 2`, na mesma ordem de operações da referência, passou a gerar os mesmos doubles bit a bit. Geometria não perdoa: antes de otimizar qualquer coisa matemática, validei contra um gabarito conhecido.

## Como executar

Requisitos: Node.js 18 ou superior.

```bash
npm ci
npm run solve -- --input caminho/dataset1.txt --output saida.json
npm run solve:all   # gera outputs/output1.json a output7.json com tempo por dataset
npm run validate    # compara outputs 1 e 2 contra os gabaritos oficiais
```

A pasta de datasets é configurável pela variável `DATA_DIR` no `solve:all`. Os JSONs finais ficam em `outputs/`, no formato exigido pelo enunciado, com `tipo`, `monitoradosEncontro` em ordem ascendente, `posicoes` por id e `distanciaMetros` como double não arredondado.

## Resultados

| Dataset | Tempo | Encontros | generico | faccao | protetiva |
|---|---:|---:|---:|---:|---:|
| dataset1 | 27 ms | 4 | 2 | 1 | 1 |
| dataset2 | 50 ms | 6 | 3 | 2 | 1 |
| dataset3 | 180 ms | 10 | 5 | 3 | 2 |
| dataset4 | 669 ms | 15 | 7 | 5 | 3 |
| dataset5 | 1.634 ms | 21 | 10 | 7 | 4 |
| dataset6 | 13.131 ms | 27 | 12 | 9 | 6 |
| dataset7 | 19.893 ms | 35 | 15 | 12 | 8 |

Os outputs 1 e 2 são byte-idênticos aos gabaritos `respostas1.json` e `respostas2.json` distribuídos pela organização: mesmo conjunto de pares, tipos, posições e valores de distância.

## Por que esta abordagem

Procurar vizinho num grid e descartar o resto é o mesmo princípio de index espacial (R-tree, geohash) no formato mais simples possível para janelas curtas, sem biblioteca externa: só Node builtins e TypeScript. Cada janela fica em memória uma vez e sai. Com isso o processamento é essencialmente a leitura dos bytes: nos testes, o arquivo de 638 MB levou cerca de 20 segundos na minha máquina, majoritariamente I/O. A unicidade por par normalizado elimina um dos erros clássicos deste tipo de problema, registrar o mesmo encontro nas duas direções ou em bobinas redundantes.

## Estrutura do repositório

```
src/       tipos, parser CSV, Haversine, detector e orquestração streaming
scripts/   CLI (solve), execução em lote (solve-all) e validação (validate)
outputs/   JSONs de saída dos sete datasets
site/      apresentação do desafio em React + Vite
```

A pasta `site/` é uma apresentação visual do desafio para o processo seletivo, servida no subdomínio próprio; o desafio em si está todo na raiz.
