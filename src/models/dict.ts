import { ModelStatus } from "../types/status";
import { Model } from "./base";
import { modelStatus } from "../utils/decors/status";
import { Exception } from "../utils/exceptions";
import { DictConfig, DictDefinition, DictChunk } from "../types/dict";
import { ChildrenOF } from "../types/reflex";

export abstract class DictModel<
    T extends DictDefinition
> extends Model<T> {
    protected _children!: ChildrenOF<T>;
    public get children() { 
        const result: Model[] = [];
        for (const key in this._children) {
            const value = this._children[key];
            if (value) result.push(value);
        }
        return result;
    }

    constructor(config: DictConfig<T>) {
        super(config);
        this._children = {} as ChildrenOF<T>;
        for (const key in config.children) {
            this.set(key, config.children[key]);
        }
    }

    public get<K extends keyof ChildrenOF<T>>(
        key: K
    ): ChildrenOF<T>[K] {
        return this._children[key];
    }

    @modelStatus(
        ModelStatus.MOUNTED,
        ModelStatus.INITED
    )
    public set<K extends keyof ChildrenOF<T>>(
        key: K, 
        child: ChildrenOF<T>[K]
    ) {
        if (this._children[key]) { 
            throw new Exception();
        }
        this._children[key] = child;
        child.mount(this);
    }

    @modelStatus(
        ModelStatus.MOUNTED,
        ModelStatus.INITED
    )
    public remove(key: keyof ChildrenOF<T>) {
        const child = this._children[key];
        delete this._children[key];
        child.unmount();
    }

    public serialize(): DictChunk<T> {
        const result = super.serialize();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const children = {} as any;
        for (const key in this._children) {
            children[key] = this._children[key].serialize();
        }
        return {
            ...result,
            children
        };
    }

} 
