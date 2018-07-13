# CSV Object
A line-to-object csv reader.

## Install
	$ npm install csv-object --save

  

## About
The *csv-object package* is a csv file reader which use the header (file's first line) as template for building complex objects structures.

  

## Config
| name | type | default value |
|--|--|--|
| file | string | `''` |
| separator | regex | `/;(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/` |
| encoding | string | `utf-8` |
  

## Demo

***> demo.csv***
```
item.nome;item.custo;mao_de_obra.nome
tinta fosca;10.5;pintor
tinta acrílica;3.0;pintor
cimento;20.0;pedreiro
```
***> index.js***
```javascript
const CsvObject = require('csv-object');

const reader = new  CsvObject({ file:  './demo.csv' });

reader
	.onStart(() => {
		console.log('Starting to read!\n');
	})
	.forEach((objs, index) => {
		console.log(JSON.stringify(objs, null, 4));
	})
	.onFinish(tot  => {
		console.log(`\nTotal of Objects: ${tot}`);
	});
```
***> output***
```json
Starting to read!

{
    "item": {
        "nome": "tinta fosca",
        "custo": "10.5"
    },
    "mao_de_obra": {
        "nome": "pintor"
    }
}
{
    "item": {
        "nome": "tinta acrílica",
        "custo": "3.0"
    },
    "mao_de_obra": {
        "nome": "pintor"
    }
}
{
    "item": {
        "nome": "cimento",
        "custo": "20.0"
    },
    "mao_de_obra": {
        "nome": "pedreiro"
    }
}

Total of Objects: 3
```


## License
```
MIT License

Copyright (c) 2017 Rodrigo Brabo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```