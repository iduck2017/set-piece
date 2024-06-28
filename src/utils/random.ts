function randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomEnum<T>(...args: T[]): T {
    const max = args.length - 1;
    const random = randomNumber(0, max);
    return args[random];
}

export {
    randomEnum,
    randomNumber
};