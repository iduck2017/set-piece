export class Event<P = any> {
    protected readonly _brand = Symbol('event');

    public readonly detail: P;
    constructor(detail: P) {
        this.detail = detail;
    }
}

export class ChangeEvent<T = any> extends Event<{ next: T }> {}

export abstract class PrevEvent<P> extends Event<P> {
    protected readonly _brand = Symbol('prev-event');

    private _aborted: boolean = false;
    public get aborted() {
        return this._aborted;
    }

    public abort() {
        this._aborted = true;
    }
}

