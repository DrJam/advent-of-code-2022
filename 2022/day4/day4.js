import { readFile } from 'node:fs/promises';;

function run(input) {
    const min = 0, max = 1;
    let elves = input.split('\r\n').map(x => x.split(',').map(x => x.split('-').map(num => parseInt(num))));

    let countTotalOverlap = elves.reduce((sum, elfPair) => {
        if (elfPair[0][min] <= elfPair[1][min] && elfPair[0][max] >= elfPair[1][max]) return sum + 1;
        if (elfPair[1][min] <= elfPair[0][min] && elfPair[1][max] >= elfPair[0][max]) return sum + 1;
        return sum;
    }, 0);

    let countAnyOverlap = elves.reduce((sum, elfPair) => {
        if (elfPair[0][max] >= elfPair[1][min] && elfPair[0][min] <= elfPair[1][max]) return sum + 1;
        return sum;
    }, 0);

    console.log(`04a: ${countTotalOverlap}`);
    console.log(`04b: ${countAnyOverlap}`);
}

function execute() {
    readFile('./2022/day4/day4.txt').then(value => run(value.toString()));
}

export default { execute }