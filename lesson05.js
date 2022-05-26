const http = require('http');
const path = require('path');
const fs = require('fs');
const { Transform } = require('stream');

const filePath = path.join(__dirname, 'index.html');
const initDir = __dirname;

const setResponse = (response, content) => {
    const readStream = fs.createReadStream(filePath, 'utf-8');

    const transformStream = new Transform({
        transform(chunk, encoding, callback) {
            const transformedChunk = chunk.toString().replace('{{content}}', content);
            callback(null, transformedChunk);
        }
    });

    response.writeHead(200, { 'Content-Type': 'text/html' });
    readStream.pipe(transformStream).pipe(response);
};

http.createServer((request, response) => {
    if (request.method === 'GET') {
        const selectedPath = path.join(initDir, request.url);

        if (fs.lstatSync(selectedPath).isDirectory()) {
            // чтение содержимого директории, формирование списка
            fs.readdir(selectedPath, (error, files) => {
                let li = '';
                files.forEach(file => {
                    const fileUrl = request.url === '/' ? file : request.url.substring(1) + '/' + file;

                    li += `<li><a href="${fileUrl}">${fileUrl}</a></li>`;
                });
                const content = `<h3>Вы находитесь в папке ${selectedPath}. Выберите файл</h3><ul>${li}</ul>`
                setResponse(response, content);
            })
        }
        else {
            // чтение файла
            fs.readFile(selectedPath, 'utf-8', (error, data) => {
                const content = `<h3>Содержимое файла ${selectedPath}</h3><p>${data.toString()}</p>`;
                setResponse(response, content);
            });
        }
    }
    else
        response.end('Method not allowed');
}).listen(3000, 'localhost');