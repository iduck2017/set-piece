export class Event {
    protected readonly _brand = Symbol('event')
}

export abstract class PostEvent<P, R> extends Event {
    protected readonly _brand = Symbol('post-event')

    constructor(props: {
        options: P;
        result: R;
    }) {
        super();
        this.options = props.options;
        this.result = props.result;
    }

    public readonly options: P;
    public readonly result: R;
}

export abstract class PrevEvent<P> extends Event {
    protected readonly _brand = Symbol('prev-event')

    constructor(props: {
        options: P;
    }) {
        super();
        this.options = props.options;
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
