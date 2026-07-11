export class Frame<T = any> {
    protected readonly _brand = Symbol('frame')

    protected _detail: T;
    public get detail() { return this._detail; }

    /**
     * Store the frame payload passed by the producer.
     *
     * @param detail - Payload delivered to frame consumers.
     */
    constructor(detail: T) {
        this._detail = detail
    }
}

export class DiffFrame<T = any> extends Frame<{ next: T }> {}
