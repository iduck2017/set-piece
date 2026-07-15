/**
 * Create a method decorator that groups console output for a method call.
 *
 * This is a development helper. It opens a console group named after the class
 * and method, runs the original method, then closes the group.
 *
 * @returns Method decorator for grouped logging.
 */
export function useLog() {
    return function(
        prototype: object,
        key: string,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => any>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: any[]) {
            console.group(`${prototype.constructor.name}.${key}`);
            const output = handler.apply(this, args);
            console.groupEnd();
            return output;
        }
        return descriptor;
    }
}
