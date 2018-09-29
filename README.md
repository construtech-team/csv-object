
# CSV Object

A super csv file reader/object parser.

  

## Install

	$ npm install csv-object --save

  

## Options
| name | type | default | description |
|--|--|--|--|
| file | String | null | single path to specific file. `/path/to/file.csv` |
| files | [String, Array, Object] | null | cannot be used together with previous option. Accept single and multiple pattern file paths using wildcards, such as: `/path/to/*.csv`, `['/path/to/*.p1.csv', '/path/to/*.p2.csv']`. This option also allows you to `watch` a directory, such as we gonna see at the last example|
| separator | String | `/;(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/` | Accept both simple strings(`','`) and regex patterns
| encoding | String | `utf-8` | the file encoding
| header | Array | `[]` | the column name which will be parsed into an object structure. Each array position must be related with the file's column index. This header also may be specified on the first line of the file and, if it is what you want, you should not pass this option into the CsvObject constructor.
| firstLine | Boolean | `true` | read the first line or not
| format | Array<object> or [Function] | null | delegate functions to format and transform every or a specific cell value.

## Methods

| name | required | description | response |
|--|--|--|--|
| onStart | false | callback executed before each reading | absolute file path with name |
| forEach | true | callback executed on each line of the files | line parsed into object and line index |
| onFinish | false | callback executed after each reading | total of lines read |

## Demos
For the next examples, let's assume we have two different scenarios. On the first, our csv file (`with-header.csv`) defines the object structure desired on its own (first line). The second does not have any header, so we gonna have to define it into the configuration header option. 

***> with-header.csv***
```
item.nome;item.custo;mao_de_obra.nome
tinta fosca;10.5;pintor
tinta acrílica;3.0;pintor
cimento;20.0;pedreiro
```
***> without-header.csv***
```
tinta fosca,10.5,pintor
tinta acrílica,3.0,pintor
cimento,20.0,pedreiro
```

### DEMO I
***> index.js***
```javascript
const CsvObject = require('csv-object');
const reader = new CsvObject({ file: './with-header.csv' });

reader.forEach((objs, index) => {
	console.log('Index: ', index);
	console.log(JSON.stringify(objs, null, 4));
});
```

***> output***
```bash
Index: 0
{
	"item": {
		"nome": "tinta fosca",
		"custo": "10.5"
	},
	"mao_de_obra": {
		"nome": "pintor"
	}
}
Index: 1
{
	"item": {
		"nome": "tinta acrílica",
		"custo": "3.0"
	},
	"mao_de_obra": {
		"nome": "pintor"
	}
}
Index: 2
{
	"item": {
		"nome": "cimento",
		"custo": "20.0"
	},
	"mao_de_obra": {
		"nome": "pedreiro"
	}
}
```
As you might see at the example above, with the minimum configuration, the csv-object gets the first line of our csv file and build a complex nested object.


### DEMO II
Now let's add some more options to our example.
***> index.js***
```javascript
const CsvObject = require('csv-object');

const addCompliment = value => {
	return `${value} is nice!`
}

const reader = new CsvObject({ 
	files: './with-*.csv',
	encoding: 'latin1',
	format: addCompliment
});

reader.forEach((objs, index) => {
	console.log('Index: ', index);
	console.log(JSON.stringify(objs, null, 4));
});
```

***> output***
```bash
Index: 0
{
	"item": {
		"nome": "tinta fosca is nice!",
		"custo": "10.5 is nice!"
	},
	"mao_de_obra": {
		"nome": "pintor is nice!"
	}
}
Index: 1
{
	"item": {
		"nome": "tinta acrílica is nice!",
		"custo": "3.0 is nice!"
	},
	"mao_de_obra": {
		"nome": "pintor is nice!"
	}
}
Index: 2
{
	"item": {
		"nome": "cimento is nice!",
		"custo": "20.0 is nice!"
	},
	"mao_de_obra": {
		"nome": "pedreiro is nice!"
	}
}
```
A few things are going on here! 
First, the `encoding` option was added to prevent any caracter problems.
Second, you have seen the `format` option, which can transform any or an specific value of a cell, in this case adding `is nice` to every value.
Finally, we change the `file` option by `files`, which means we're no longer need to define a specific filename, but find it or them by pattern(`./with-*.csv`)

### DEMO III
Let's change our file to `without-header.csv` and add every options allowed. To the `watch` option, we gonna need to add into our project a `queue` and a `done` directories and put our file into `queue` folder.

***> index.js***
```javascript
const CsvObject = require('csv-object');

const addCompliment = value => {
	return `${value} is cool!`
}

const reader = new CsvObject({ 
	encoding: 'utf-8',
	separator:  ',',
	header: [
		'item.nome',
		'item.custo',
		'mao_de_obra.nome'
	],
	format: [{
		'item.nome': addCompliment
	}],
	firstLine:  true,
	files: {
		src:  'queue/without-*.csv',
		dest:  'done',
		watch:  1000
	}
});

reader
	.onStart(file  => {
		console.log(`Starting to read: ${file}\n`);
	})
	.forEach((objs, index) => {
		console.log('Index: ', index);
		console.log(JSON.stringify(objs, null, 4));
	})
	.onFinish(tot  => {
		console.log(`\nTotal of Objects: ${tot}`);
	});
```

***> output***
```bash
Starting to read: /absolute-path-to/queue/without-header.csv

Index: 0
{
	"item": {
		"nome": "tinta fosca is cool!",
		"custo": "10.5"
	},
	"mao_de_obra": {
		"nome": "pintor is nice!"
	}
}
Index: 1
{
	"item": {
		"nome": "tinta acrílica is nice!",
		"custo": "3.0 is nice!"
	},
	"mao_de_obra": {
		"nome": "pintor is nice!"
	}
}
Index: 2
{
	"item": {
		"nome": "cimento is nice!",
		"custo": "20.0 is nice!"
	},
	"mao_de_obra": {
		"nome": "pedreiro is nice!"
	}
}

Total of Objects: 3
```
**Ok, now this is really funny!**

First, we have changed our `encoding` and our `separator`. Just because we can... and also because our separator has changed into the file. 

Second, we have no longer the `header` definition into our file (`without-header.csv`), so we had to do it into our configurations. It is important to know that every header definition into the array is relating its index position with the files columns.

We have defined our `format` function to transform a specific column (or leaf), no more for everything.

The `firstLine: true` here is optional, since its default value already is that. But, let's suppose  we were reading the `with-header.csv` and assume the definition of the head into our configurations, not into the file. We probably would not want to read the first line. To that case, we could easily set this option to `false`.

The most significant change is the `files` option. In this scenario, we want to watch a directory to catch every file which match with our pattern provided into `src` option, read and then move to another directory defined on `dest` option, preventing those files to not be read anymore. The `watch` option is going to set the timeout to listen for changes into our `src` path.

Finally, the `onStart` and `onFinish` methods will be executed on every reading before starting the iterations (returning the filepath at the time) and at end (return the total of lines read), respectively. 

## That's it! 
If you have some questions or any suggestions, let us know.  


## License

```

MIT License

  

Copyright (c) 2017 Rodrigo Brabo
  

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the 
"Software"), to deal in the Software without restriction, including 
without limitation the rights to use, copy, modify, merge, publish, 
distribute, sublicense, and/or sell copies of the Software, and to 
permit persons to whom the Software is furnished to do so, subject to 
the following conditions:

The above copyright notice and this permission notice shall be included 
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
