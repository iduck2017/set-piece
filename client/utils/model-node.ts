import type { App } from "../app";
import { BaseModel } from "../types/model";
import { Node } from "./node";

export class ModelNode<
    P extends BaseModel,
    L extends BaseModel[],
    D extends Record<string, BaseModel>,
> extends Node<P, L, D, BaseModel> {
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
}