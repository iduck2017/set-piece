import type { App } from "../app";
import { BaseModel } from "../types/model";
import { Node } from "./node";

export class ModelNode<
    P extends BaseModel | App,
    C extends BaseModel,
    D extends Record<string, C>,
> extends Node<P, C, D, BaseModel | App> {
    public _add(value: C): void {
        super._add(value);
        value.mount({
            app: this.container.app,
            parent: this.parent
        });    
    }

    public _del(value: C): void {
        super._del(value);
        value.unmount();
    }

    public _set<K extends keyof D>(
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