const CsvObject = require('.');

const reader = new CsvObject({ file: './demo.csv' });

reader
   .onStart(() => {
      console.log('Starting to read!\n');
   })
   .forEach((objs, i) => {
      console.log(JSON.stringify(objs, null, 4));
   })
   .onFinish(qtd => {
      console.log(`\nLines: ${qtd}`);
   });