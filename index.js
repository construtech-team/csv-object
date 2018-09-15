const deepmerge = require('deepmerge');
const lineReader = require('line-reader');

const { EventEmitter } = require('events');
const readerEvent = new EventEmitter();

module.exports = class CsvObject {
    constructor(config){
        this.index = 0;        
        this.file = '';
        this.reader = {};        
        this.separator = config.separator || /;(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
        this.encoding = config.encoding || 'utf-8';
        this.model = {};
        this.header = config.header || [];
        this.format = config.format;

        this.setFile(config.file);
        this.init();
    }

    init(){
        lineReader
            .open(this.file, {
                encoding : this.encoding
            }, (function(err, reader) {
                if (err) throw err;
                
                this.reader = reader;

                readerEvent.emit('ready');
            }).bind(this))
    }

    setFile(file){
        if(!file || file == '')
            throw new Error('No file provided.')
        
        this.file = file;
    }

    onStart(cb){
        cb(this.file);

        return this;
    }

    forEach(cb){
        readerEvent.on('ready', (() => this.read(cb)).bind(this));

        return this;
    }

    onFinish(cb){
        readerEvent.on('finish', (() => cb(this.index)).bind(this));        
    }    

    read(cb){
        if (this.reader.hasNextLine()) {            
            return new Promise(resolve => {
                this.reader.nextLine(function(err, line) {
                    resolve(line)
                });
            })
            .then(line => {
                if(line){
                    let cols = line.toString().split(this.separator);
                    
                    if(this.index === 0 && this.header.length === 0){
                        this.setHeader(cols);
                        this.index++;
                        
                        return;
                    } else {
                        this.setModel(cols);
                        
                        return cb(this.model, parseInt(++this.index));
                    }                     
                }
            })
            .then(() => this.read(cb));                
        } else {
            this.reader.close(function(err) {
                if (err) throw err;

                readerEvent.emit('finish');
            });
        }   
    }

    setModel(cols){
        const arrObjects = this.header.map((colHeader, indexHeader) => {
            const fn = this.format instanceof Array
                ? this.format.find(key => key[colHeader])
                : { [colHeader] : this.format };

            const keys = colHeader.split('.').reverse();
            
            return keys.reduce((prevKey, crrKey) => {
                return {
                    [crrKey]: typeof prevKey === 'string' && fn ? fn[colHeader](prevKey) : prevKey
                }
            }, cols[indexHeader]);
        });
    
        this.model = deepmerge.all(arrObjects);
    }    

    setHeader(cols){
        this.header = cols;
    }
}