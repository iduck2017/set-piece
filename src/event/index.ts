export class Event<P = any> {
    protected readonly _brand = Symbol('event');

    public readonly detail: P;
    /**
     * Store the event payload passed by the producer.
     *
     * @param detail - Payload delivered to event consumers.
     */
    constructor(detail: P) {
        this.detail = detail;
    }
}

export class DiffEvent<T = any> extends Event<{ next: T }> {}

export abstract class PrevEvent<P> extends Event<P> {
    protected readonly _brand = Symbol('prev-event');

    private _aborted: boolean = false;
    public get aborted() { return this._aborted; }

    /**
     * Mark the previous-value event as aborted by a consumer.
     *
     * Consumers can call this to communicate that a previous-value flow should
     * stop.
     *
     * @returns Nothing.
     */
    public abort() {
        this._aborted = true;
    }
}
