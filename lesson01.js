const colors = require('colors/safe');

const isPrime = (n) => {
    if (n < 2)
        return false;

    for (let i = 2; i <= n / 2; i++)
        if (n % i === 0)
            return false;

    return true;
}

const getColor = (n) => {
    switch (n % 3) {
        case 0:
            return colors.green;
        case 1:
            return colors.yellow;
        case 2:
            return colors.red;
    }
}

/*
Андрей, готова поспорить с вами о месте переменных в коде. На вебинаре Вы заострили внимание на том,
что определение вспомогательной переменной, меняюще в коде свое значение должна быть выше определения
констант.

Для человека, который в дальнейшем будет читать код, важнее узнать именно константы, в данном случае
входные параметры. Именно они должны быть вверху.
А на инициализацию вспомогательной переменной в самом верху кода - ему все равно, поскольку эта переменная
повторюсь вспомогательная, и к тому же по коду может использоваться и менять свое значение во многих местах.
*/

const startRange = +process.argv[2];
const endRange = +process.argv[3];

if (!(Number.isInteger(startRange) && Number.isInteger(endRange))) {
    console.log('Один или оба параметров не являются целыми числами');
    process.exit(-1);
}

let primeCount = 0;
for (let n = startRange; n <= endRange; n++)
    if (isPrime(n)) {
        const color = getColor(primeCount);
        console.log(color(n));
        primeCount++;
    }

if (primeCount === 0)
    console.log(colors.red(`В диапазоне ${startRange} - ${endRange} нет простых чисел!`))