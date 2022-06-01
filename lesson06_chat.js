const io = require('socket.io');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { faker } = require('@faker-js/faker');

let userCount = 0;

const app = http.createServer((request, response) => {
    if (request.method === 'GET') {
        const filePath = path.join(__dirname, 'chat.html');
        const readStream = fs.createReadStream(filePath, 'utf-8');

        readStream.pipe(response);
    }
    else if (request.method === 'POST') {
        let data = '';

        request.on('data', chank => data += chank);

        request.on('end', () => {
            const parsedData = JSON.parse(data);
            console.log(parsedData);

            response.writeHead(200, { 'Content-Type': 'json' });
            response.end(data);
        })
    }
    else {
        response.statusCode = 405;
        response.end();
    }
});

const socket = io(app);

socket.on('connection', socket => {
    console.log('new connection');

    userCount++;

    const userName = faker.name.findName();

    socket.broadcast.emit('newConnection', { userName: userName, userCount: userCount });
    socket.emit('yourConnection', { userName: userName, userCount: userCount });

    socket.on('newMessage', data => {
        socket.broadcast.emit('newMessage', data);
        socket.emit('newMessage', data);
    });

    socket.on('disconnect', reason => {
        userCount--;

        socket.broadcast.emit('newDisconnection', { userName: userName, userCount: userCount })
    });
});

app.listen(3000, 'localhost');