const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const { Transform } = require('stream');
const { Worker } = require('worker_threads');

const filePath = path.join(__dirname, 'search.html');
const initDir = __dirname;

const setResponse = (response, content) => {
    console.log('setResponse');

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

const search = (workerData) => {

    return new Promise((resolve, reject) => {
        const worker = new Worker('./worker.js', { workerData });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        })
    })
};

http.createServer((request, response) => {
    if (request.method === 'GET') {
        //console.log('request.url = ' + request.url);
        const urlInfo = url.parse(request.url, true);
        //console.log(urlInfo);

        //const selectedPath = path.join(initDir, request.url);
        const selectedPath = path.join(initDir, urlInfo.pathname);
        //console.log(selectedPath);

        if (fs.lstatSync(selectedPath).isDirectory()) {
            // чтение содержимого директории, формирование списка
            fs.readdir(selectedPath, (error, files) => {
                let li = '';
                files.forEach(file => {
                    const fileUrl = urlInfo.pathname === '/' ? file : urlInfo.pathname.substring(1) + '/' + file;
                    li += `<li><a href="${fileUrl}">${fileUrl}</a></li>`;
                });
                const content = `<h3>Вы находитесь в папке ${selectedPath}. Выберите файл</h3><ul>${li}</ul>`
                setResponse(response, content);
            })
        }
        else {
            let content = `<h3>Содержимое файла ${selectedPath}</h3>
                <label>Строка поиска: <input id="inpSearch"></label>
                <input type="submit" id="btnSearch" value="Search">
                <br>`;

            // если с параметром, то поиск иначе отображение всего содержимого файла
            //const params = url.parse(request.url, true).query;
            const params = urlInfo.query;
            //console.log('params');
            //console.log(params);

            if (params.searchStr) {
                // поиск
                search({ filePath: selectedPath, searchStr: params.searchStr }).
                    then(result => {
                        content += result.result;
                        setResponse(response, content);
                    }).
                    catch(error => {
                        console.log('error');
                        content += error;
                        setResponse(response, content);
                    });
            }
            else
                // чтение файла
                fs.readFile(selectedPath, 'utf-8', (error, data) => {
                    content += `<p>${data.toString()}</p>`;
                    setResponse(response, content);
                });
        }
    }
    else
        response.end('Method not allowed');
}).listen(3000, 'localhost');