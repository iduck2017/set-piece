export class Frame<T = any> {
    protected readonly _brand = Symbol('frame')

    protected _detail: T;
    public get detail() {
        return this._detail;
    }

    constructor(detail: T) {
        this._detail = detail
    }
}

export class ChangeFrame<T = any> extends Frame<{ next: T }> {}
