export class Event {
    protected readonly _brand = Symbol('event')
}

export abstract class PrevEvent<P> extends Event {
    protected readonly _brand = Symbol('prev-event')

    constructor(options: P) {
        super();
        this.options = options;
    }

    public readonly options: P;

    private _isAborted: boolean = false;
    public get isAborted() {
        return this._isAborted;
    }
    public abort() {
        this._isAborted = true;
    }
}
