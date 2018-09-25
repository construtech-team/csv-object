const CsvObject = require('.');

const formatName = name => {
	return `${name} is cool!`
}

const reader = new CsvObject({ 
	header: [
		'item.nome',
		'item.custo',
		'mao_de_obra.nome'
	],
	format: [{
		'item.nome': formatName
	}],
	files: {
		src: 'files/queue/*.csv',
		dest: 'files/done',
		watch: 1000
	}
});

reader
	.onStart(file => {
		console.log(`Starting to read: ${file}`);
	})
	.forEach((objs, index) => {
		// console.log(JSON.stringify(objs, null, 4));
	})
	.onFinish(tot  => {
		console.log(`Total of Objects: ${tot}\n`);
	});