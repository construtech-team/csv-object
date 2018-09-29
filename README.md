# CSV Object
A super csv file reader/object parser.

## Install
	$ npm install csv-object --save

## Options
| name | type | default value | | default value |
|--|--|--|--|
| file | String | null | single path to specific file. `/path/to/file.csv` |
| files | [String, Array, Object] | null | accept single and multiple pattern file paths with wildcards such: `/path/to/*.csv`, `['/path/to/*.p1.csv', '/path/to/*.p2.csv']`. This option also allows you to watch a directory such as:
```javascript 
    files: {
		src: 'files/queue/*.csv',
		// dest: 'files/done',
		// watch: 1000
	}
```
|
| separator | regex | `/;(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/` |
| encoding | String | `utf-8` |
| header | Array | `[]` |
| firstLine | Boolean | `[]` |
| format | Array<object> or fn | null |
  
## Methods
| name | required | description | response |
|--|--|--|--|
| onStart | false | callback executed before each reading | absolute file path with name |
| forEach | true | callback executed on each line of the files | line parsed into object and line index |
| onFinish | false | callback executed after each reading | total of lines read |


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

const reader = new CsvObject({ file:  './demo.csv' });

reader
	.onStart(file => {
		console.log(`Starting to read: ${file}`);
	})
	.forEach((objs, index) => {
		console.log(JSON.stringify(objs, null, 4));
	})
	.onFinish(tot  => {
		console.log(`Total of Objects: ${tot}\n`);
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
As you might see at the example above, the csv-object gets the first line of our csv file and build an nested object using 'dots' as reference to do it.

That first line is not really necessary. We may want to let our csv file clear and remove the first line. But, of course we still need to provide a reference to build our output object. To do so, we must use the property a `header` and put our desired structure into an array, which the index will let our reader to understand 'which value belong to which object leaf'.

To the next example, let's remove the first line, change the separator and put all options together.

***> demo.csv***
```
tinta fosca,10.5,pintor
tinta acrílica,3.0,pintor
cimento,20.0,pedreiro
```
***> index.js***
```javascript
const CsvObject = require('csv-object');

const reader = new  CsvObject({ 
    file: './demo.csv',
    separator: ',',
    encoding: 'latin1',
	header: [
		'item.nome',
		'item.custo',
		'mao_de_obra.nome'
	],
	format: [{
		'mao_de_obra.nome': formatName
	}]
});

const formatName = name => {
    return `...é um bom ${name}`;
}

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
        "nome": "...é um bom pintor"
    }
}
{
    "item": {
        "nome": "tinta acrílica",
        "custo": "3.0"
    },
    "mao_de_obra": {
        "nome": "...é um bom pintor"
    }
}
{
    "item": {
        "nome": "cimento",
        "custo": "20.0"
    },
    "mao_de_obra": {
        "nome": "...é um bom pedreiro"
    }
}

Total of Objects: 3
```
A few things are happening here. First, as much we strongly recommend you to use regex to separators, you are not obligated to do it. The header was introduced to you as told before and, finally, a new property was show: format.
The `format` property does what its name means: it format an input value and transform the output. This option can be used to defining property by property as an array of object (such as you can see above) or for all of the columns.
To test it, instead of define an array, you should just pass the formater function and the reader will apply it to every column.

```javascript
const reader = new  CsvObject({ 
    file: './demo.csv',
    separator: ',',
    encoding: 'latin1',
	header: [
		'item.nome',
		'item.custo',
		'mao_de_obra.nome'
	],
	format: formatName
});
```

That's it! If you have some questions or Suggestions, let us know.

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