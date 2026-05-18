
export class View {
    protected readonly _brand = Symbol('view')

    public get name() {
        return this.constructor.name;
    }


    public get descendants(): View[] {
        const result: View[] = [];
        this.children.forEach(child => {
            result.push(child);
            result.push(...child.descendants);
        });
        return result;
    }

    public get children(): View[] {
        const result: View[] = [];
        const iterators = childRegistry.query(this);
        iterators.forEach((iterator, key) => {
            result.push(...iterator(this, key));
        });
        return result;
    }

    private _parent?: View;
    public get parent() {
        return this._parent;
    }

    private _root: View = this;
    public get root() {
        return this._root;
    }

    private mount(parent: View) {
        if (this._parent) return;
        this._parent = parent;
        this.updateRoute();
    }

    private unmount() {
        if (!this._parent) return
        this._parent = undefined;
        this.updateRoute();
    }

    private updateRoute() {
        const routeTypeMap = routeRegistry.query(this);
        routeTypeMap.forEach((type: Function, key: string) => {
            let ancestor: View | undefined = this;
            while (ancestor) {
                if (ancestor instanceof type) break;
                ancestor = ancestor.parent;
            }
            Reflect.set(this, key, ancestor);
        });
        let root: View = this;
        while (root.parent) root = root.parent;
        this._root = root;
        this.children.forEach((child: View) => child.updateRoute());
    }

}