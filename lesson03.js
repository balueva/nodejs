const fs = require('fs');
const { Transform } = require('stream');

const sourceFileName = './access.log';
const getResultFileName = (ip) => `./${ip}_requests.log`;

const ipList = ['89.123.1.41', '34.48.240.111'];

const readStream = fs.createReadStream(sourceFileName, 'utf-8');

ipList.forEach(ip => {
    const regExp = new RegExp('^' + ip + '.*$', 'gm');
    const resultFileName = getResultFileName(ip);

    const transformStream = new Transform({
        transform(chunk, encoding, callback) {
            const transformedChunk = chunk.toString().match(regExp).join('\n');
            callback(null, transformedChunk);
        }
    });

    const writeStream = fs.createWriteStream(resultFileName, 'utf-8');

    readStream.pipe(transformStream).pipe(writeStream);
});
