/**
 * Base payload for messages dispatched through anime boundaries.
 */
export abstract class Frame<T = any> {
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

/**
 * Payload-free signal for property changes produced from dependency writes.
 */
export abstract class DiffFrame extends Frame<void> {
    constructor() {
        super(undefined);
    }
}
