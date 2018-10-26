const deepmerge = require('deepmerge');
const lineReader = require('line-reader');
const requireFiles = require('require-files');
const { EventEmitter } = require('events');


module.exports = class CsvObject {
    constructor(config){
        this._callbackStart;
        this._callbackFinish;
        this.readerEvent = new EventEmitter();
        this.file = config.file;
        this.files = config.files;        
        this.indexRows = 0;
        this.reader = {};        
        this.separator = config.separator || /;(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
        this.encoding = config.encoding || 'utf-8';
        this.model = {};
        this.header = config.header || [];
        this.headerFromFile = this.header.length > 0 ? false : true;
        this.format = config.format;
        this.firstLine = config.firstLine != null ? config.firstLine : true;

        this.init();
    }

    init() {
        if(this.file){            
            this.open(this.file);
        } else {
            const files = this.getFiles();

            if(this.files.watch){
                if(!this.files.dest){
                    throw new Error('No destiny path provided.')
                } else {
                    this.watch(files);
                }                
            } else {
                this.iterate(files);
            }
        }
    }

    open(file){
        this.model = {};

        if(this.headerFromFile)
            this.header = [];

        lineReader
            .open(file, {
                encoding : this.encoding
            }, ((err, reader) => {
                if (err) throw err;
                
                this.reader = reader;
                
                this._callbackStart && this._callbackStart(file);

                this.readerEvent.emit('ready');
            }).bind(this))
    }
    
    getFiles(){
        let files = [];
        
        if(this.files){
            if(this.files.src instanceof Array){
                files = requireFiles.get(this.files.src);
            } 
            else if(typeof this.files.src == 'string'){
                files = requireFiles.get([this.files.src]);
            }        
            else if(this.files instanceof Array){
                files = requireFiles.get(this.files);
            } 
            else if(typeof this.files == 'string'){
                files = requireFiles.get([this.files]);
            }
        }
        
        return files;
    }
  
    watch(files){
        this.indexRows = 0;
        
        if(files.length > 0){            
            this.open(files[0])

            this.readerEvent.on('finish', (() => {
                this.readerEvent.removeAllListeners('finish');
                    
                this._callbackFinish && this._callbackFinish(this.indexRows);

                this.moveToDone(files.shift(), this.files.dest, () => this.watch(files));                
            }).bind(this));
        }
        else {
            const files = this.getFiles();

            setTimeout((() => this.watch(files)).bind(this), this.files.watch);
        }    
    }

    iterate(files){
        this.indexRows = 0;
        
        if(files.length > 0){            
            this.open(files[0]);

            this.readerEvent.on('finish', (() => {
                if(files.length > 0){
                    this.readerEvent.removeAllListeners('finish');
                    
                    this._callbackFinish && this._callbackFinish(this.indexRows);

                    files.shift(); 
                    
                    return this.iterate(files);
                }
            }).bind(this));
        }
    }

    moveToDone(file, path, cb){
        const { exec } = require('child_process');
        
        exec(`mv ${file} ${path}`, 
            (err, stdout, stderr) => {                    
                if (err) return;

                cb();
            });
    }

    onStart(cb){
        this._callbackStart = cb;      

        return this;
    }

    forEach(cb){
        this.readerEvent
            .on('ready', (() => this.read(cb)).bind(this));

        return this;
    }

    onFinish(cb){
        this._callbackFinish = cb;

        return this;
    }    

    read(cb, canRead = false){
        if (this.reader.hasNextLine()) {
            return new Promise(resolve => {
                this.reader.nextLine((err, line) => {
                    resolve(line)
                });
            })
            .then(line => {
                if(line){
                    let cols = line.toString().split(this.separator);
                    
                    if(this.indexRows === 0 && this.firstLine){
                        if(this.header.length === 0){
                            this.header = cols;
                            canRead = false;

                            return canRead;
                        }
                        else {
                            this.setModel(cols);
                            
                            canRead = true;
                            
                            if(!cb.then){
                                cb(this.model, this.indexRows);
                                
                                return canRead;
                            }
                            
                            return cb(this.model, this.indexRows).then(() => {                                
                                this.indexRows++;

                                return canRead;
                            });
                            
                        }
                    } else if(canRead){                        
                        this.setModel(cols);
                        
                        if(!cb.then){
                            cb(this.model, this.indexRows++);

                            return canRead;
                        }

                        return cb(this.model, this.indexRows++).then(() => canRead)
                    } else {
                        return !canRead;
                    }
                }
            })
            .then(cr => this.read(cb, cr));
        } else {
            this.reader.close(((err) => {
                if (err) throw err;

                this.readerEvent.emit('finish');
            }).bind(this));            
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
                    [crrKey]: typeof prevKey === 'string' && fn && this.format ? fn[colHeader](prevKey) : prevKey
                }
            }, cols[indexHeader]);
        });
    
        this.model = deepmerge.all(arrObjects);
    }
}
