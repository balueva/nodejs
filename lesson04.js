#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const inquirer = require('inquirer');
const { Transform } = require('stream');

const isFile = fileName => {
    return fs.lstatSync(fileName).isFile();
}

const options = yargs
    .usage('Использование: -d <dir>')
    .option('d', {
        alias: 'initialDir', describe: 'Директория для работы программы', type: 'string',
        demandOption: false
    })
    .argv;

const initialDir = options.initialDir ? options.initialDir : process.cwd();

const selectFile = (filePath) => {
    inquirer
        .prompt([
            {
                name: 'fileName',
                type: 'list',
                message: 'Вы находитесь в директории ' + filePath + '. Выберите файл:',
                choices: fs.readdirSync(filePath)
            }])
        .then((answer) => {
            const newFilePath = path.join(filePath, answer.fileName);
            console.log(newFilePath);

            if (!isFile(newFilePath))
                return selectFile(newFilePath);
            else {
                // если выбран файл, запрашиваем строку для поиска
                inquirer
                    .prompt([
                        {
                            name: 'searchStr',
                            type: 'input',
                            message: 'Введите строку для поиска:',
                        }])
                    .then((answer) => {
                        const regExp = new RegExp('^.*' + answer.searchStr + '.*$', 'gm');

                        const readStream = fs.createReadStream(newFilePath, 'utf-8');
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
                    });
            }
        });
};

selectFile(initialDir);


