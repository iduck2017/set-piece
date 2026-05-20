export function useConsoleGroup() {
    return function(
        _prototype: object,
        _key: string,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => any>,
    ) {
        const method = descriptor.value;
        if (!method) return descriptor;
        descriptor.value = function(...args: any[]) {
            // console.group(`${prototype.constructor.name}.${key}`);
            const result = method.apply(this, args);
            // console.groupEnd();
            return result;
        }
        return descriptor;
    }
}