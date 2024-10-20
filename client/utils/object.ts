Object.prototype.format = function<
    T extends string,
    A extends Record<T, any>,
    B extends Record<T, any>,
>(
    this: A,
    formatValue: (value: A[T]) => B[T] 
): B {
    const result = {} as B;
    Object.keys(origin).forEach((key: T) => {
        result[key] = formatValue(this[key]);
    });
    return result;
};