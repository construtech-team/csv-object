const CsvObject = require('.');

const formatName = name => {
	return `${name} is an idiot!`
}

const reader = new CsvObject({ 
	file: './demo.csv',
	header: [
		'item.nome',
		'item.custo',
		'mao_de_obra.nome'
	],
	format: [{
		'item.nome': formatName
	}]
});

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