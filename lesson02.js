const EventEmitter = require('events');

const eventEmitter = new EventEmitter();

class CountdownCounter {
    constructor(param) {
        this.caption = `Таймер №${param.n} (${param.d})`;

        const arr = param.d.split('-');
        this.endDate = [0, 0];
        arr.forEach(item => this.endDate.push(+item)); // this.endDate - массив окончания таймера [сек мин ч д мес г]

        const idTimer = setInterval(() => {
            const tmp = [...this.endDate];
            const currentDate = new Date();

            // текущая дата в массиве составляющих
            const arr = [currentDate.getSeconds(), currentDate.getMinutes(), currentDate.getHours(), currentDate.getDate(), currentDate.getMonth() + 1, currentDate.getFullYear()];

            // разница между датой окончания таймера (tmp) и текущей датой (arr)
            const diff = [];

            // разницу между соответсвующими элементами двух массивов находим по аналогии с вычитанием
            // столбиком, когда если уменьшаемое меньше вычитаемого, то занимаем у соседнего элемента
            // например, если в tmp кол-во сек = 10, а в arr кол-во сек = 20, то
            // в tmp занимаем 1 минуту у соседнего элемента (мин), получаем разность 10 + 60 - 20 = 50           
            const getDiffItem = (idx, v) => {
                for (let i = idx; i < tmp.length; i++) {
                    if (tmp[i] >= v)
                        return tmp[i] - v
                    else {
                        switch (i) {
                            case 0: // сек, мин
                            case 1: {
                                tmp[i + 1] = getDiffItem(i + 1, 1);
                                return tmp[i] + 60 - v;
                            }
                            case 2: { // часы
                                tmp[i + 1] = getDiffItem(i + 1, 1);
                                return tmp[i] + 24 - v;
                            }
                            case 3: { // дни
                                const y = arr[i + 2];
                                const m = arr[i + 1];
                                const daysCount = new Date(y, m, 0).getDate();
                                tmp[i + 1] = getDiffItem(i + 1, 1);
                                return tmp[i] + daysCount - v;
                            }
                            case 4: { // месяцы
                                const y = arr[i + 1];
                                const isLeap = new Date(y, 1, 29).getMonth() === 1;

                                tmp[i + 1] = getDiffItem(i + 1, 1);
                                return tmp[i] + 365 + isLeap ? 1 : 0 - v;
                            }
                            case 5: // годы
                                return -1;
                        }
                    }
                }
            }

            for (let i = 0; i < tmp.length; i++) {
                const item = getDiffItem(i, arr[i]);
                diff.push(item);
            }

            // окончание таймера, если сумма элементов массива-разницы = 0 или год = -1        
            let rest = 0;
            if (diff[diff.length - 1] >= 0)
                diff.forEach(item => rest += item);

            if (rest > 0)
                eventEmitter.emit(this.caption, { caption: this.caption, diff: diff });
            else {
                eventEmitter.emit(this.caption, { caption: this.caption });
                clearInterval(idTimer);
            }
        }, 1000)
    }
}

const onCountdownCounterChange = (payload) => {
    let s;
    const { caption, diff } = payload;

    if (diff)
        s = `До окончания таймера осталось: ${diff[5] > 0 ? diff[5] + ' лет' : ''}${diff[4] > 0 ? diff[4] + ' мес. ' : ''}${diff[3] > 0 ? diff[3] + ' дней ' : ''}${diff[2] > 0 ? diff[2] + ' ч. ' : ''}${diff[1] > 0 ? diff[1] + ' мин. ' : ''}${diff[0] > 0 ? diff[0] + ' сек. ' : ''}`;
    else
        s = 'Завершение работы';
    console.log(caption + ' ' + s);

    if (!diff)  // отписка
        eventEmitter.removeListener(caption, onCountdownCounterChange);
}

for (let i = 2; i < process.argv.length; i++) {
    const c = new CountdownCounter({ n: i - 1, d: process.argv[i] });
    eventEmitter.on(c.caption, onCountdownCounterChange);
}
