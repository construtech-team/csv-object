const Csv2object = require('csv2object');   

const reader = new Csv2object({ file: './demo.csv' });

reader
   .onStart(() => {
      console.log('Starting to read!\n');
   })
   .parseLine((objs, i) => {
      console.log(objs);
   })
   .onFinish(qtd => {
      console.log(`\nLines: ${qtd}`);
   });