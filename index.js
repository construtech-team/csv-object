const lineReader = require('line-reader');
const { EventEmitter } = require('events');
const readerEvent = new EventEmitter();

module.exports = class Csv2Object {
    constructor(config){
        this.index = 0;        
        this.file = '';
        this.reader = {};        
        this.separator = config.separator || /;(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
        this.encoding = config.separator || 'utf-8';
        this.objects = {};
        this.models = {};
        this.model = config.model || {
            separator: ".",
            remove: "_"
        }        
        
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

    parseLine(cb){
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
                    this.index === 0 ? this.setModels(cols) : this.setObjects(cols);
                }
                
                return cb(this.objects, ++this.index);
            })
            .then(() => this.read(cb));                
        } else {
            this.reader.close(function(err) {
                if (err) throw err;

                readerEvent.emit('finish');
            });
        }   
    }

    setObjects(cols){
        this.objects = cols;
    }

    setModels(cols){        
        this.objects = cols.reduce((prev, col) => {
            return Object.assign(prev, {
                [col.split('.').unshift()]: {}
            }, {});
        });

        console.log(console.log(cols))
    }
}