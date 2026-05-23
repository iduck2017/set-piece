export function useConsoleGroup() {
    return function(
        prototype: object,
        key: string,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => any>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: any[]) {
            console.group(`${prototype.constructor.name}.${key}`);
            const result = handler.apply(this, args);
            console.groupEnd();
            return result;
        }
        return descriptor;
    }
}