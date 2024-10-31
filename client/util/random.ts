
export namespace Random {
    export function number(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    export function type<T>(...args: T[]): T {
        const max = args.length - 1;
        const random = number(0, max);
        return args[random];
    }
}