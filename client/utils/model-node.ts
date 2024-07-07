import { ChunkOf, DictChunk, ListChunk } from "../types/common";
import { BaseModel, BaseModelDict, BaseModelList } from "../types/model";
import { Node } from "./node";

export class ModelNode<
    P extends BaseModel,
    L extends BaseModelList,
    D extends BaseModelDict,
> extends Node<P, L, D> {
    private _container?: BaseModel;
    public get container(): BaseModel {
        const result = this._container;
        if (!result) {
            throw new Error();
        }
        return result;
    }

    public _add(value: L[number]): void {
        super._add(value);
        value.mount({
            app: this.container.app,
            parent: this.parent
        });    
    }

    public _del(value: L[number]): void {
        super._del(value);
        value.unmount();
    }

    protected _set<K extends keyof D>(
        key: K, 
        value: D[K]
    ): void {
        super._set(key, value); 
        value.mount({
            app: this.container.app,
            parent: this.parent
        });
    }

    public _mount(options: {
        container: BaseModel,
        parent: P
    }) {
        this._parent = options.parent;
        this._container = options.container;
    }

    public _serialize() {
        const list: ListChunk<L> = [];
        for (const child of this.list) {
            list.push(child.serialize() as ChunkOf<L[number]>);
        }
        const dict = {} as DictChunk<D>;
        for (const key in this.dict) {
            dict[key] = this.dict[key].serialize() as ChunkOf<D[keyof D]>;
        }

        return {
            list,
            dict
        };
    }
}