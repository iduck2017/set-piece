
export namespace Random {
    export function number(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    export function type<T>(types: Record<string, T>): T {
        const size = Object.keys(types).length;
        const index = number(0, size - 1);
        const key = Object.keys(types)[index];
        return types[key];
    }
}