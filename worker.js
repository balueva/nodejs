console.log('worker ++');

const fs = require('fs');
console.log('worker 1');

const { workerData, parentPort } = require('worker_threads');
console.log('worker 2');

const regExp = new RegExp('^.*' + workerData.searchStr + '.*$', 'gm');
console.log('worker 3');

console.log('workerData.filePath = ' + workerData.filePath + ' workerData.searchStr = ' + workerData.searchStr);

const readStream = fs.createReadStream(workerData.filePath, 'utf-8');
const transformStream = new Transform({
    transform(chunk, encoding, callback) {
        const searchArray = chunk.toString().match(regExp);
        if (searchArray) {
            const transformedChunk = searchArray.join('\n');
            callback(null, transformedChunk);
        }
    }
});

readStream.pipe(transformStream).pipe(process.stdout);

parentPort.postMessage({ result: 'test' });