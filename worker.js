const { workerData, parentPort } = require('worker_threads');
const { Transform } = require('stream');
const fs = require('fs');

const regExp = new RegExp('^.*' + workerData.searchStr + '.*$', 'gm');

console.log('workerData.filePath = ' + workerData.filePath + ' workerData.searchStr = ' + workerData.searchStr);

const readStream = fs.createReadStream(workerData.filePath, 'utf-8');
const transformStream = new Transform({
    transform(chunk, encoding, callback) {
        const searchArray = chunk.toString().match(regExp);
        let transformedChunk = '';

        if (searchArray)
            transformedChunk = searchArray.join('\n')
        else
            transformedChunk = 'Search string not found';

        callback(null, transformedChunk);
    }
});

readStream.pipe(transformStream).on('data', data => {
    parentPort.postMessage({ result: data.toString() });
});
