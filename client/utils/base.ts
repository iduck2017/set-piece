export class Base<T = any> {
    private _container!: T;
    public get container() { return this._container; }

    public _mount(
        container: T
    ) {
        this._container = container;
    }
}
