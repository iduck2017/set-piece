import { ModelStatus } from "../types/status";
import { Model } from "./base";
import { modelStatus } from "../utils/status";
import { Exception } from "../utils/exceptions";
import { BaseData } from "../types/base";
import { BaseRefer } from "../types/common";
import { BaseModel } from "../types/model";
import type { App } from "../app";
import { DictChunk, DictConfig } from "../types/dict";

export abstract class DictModel<
    M extends number,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    E extends BaseRefer,
    H extends BaseRefer,
    P extends BaseModel | App,
    C extends Record<string, BaseModel>
> extends Model<M, R, I, S, E, H, P> {
    protected _children!: C;
    public get children() { 
        const result: BaseModel[] = [];
        for (const key in this._children) {
            const value = this._children[key];
            if (value) result.push(value);
        }
        return result;
    }

    constructor(config: DictConfig<M, R, I, S, E, H, C>) {
        super(config);
        this._children = {} as C;
        for (const key in config.children) {
            this.set(key, config.children[key]);
        }
    }

    public get<K extends keyof C>(
        key: K
    ): C[K] {
        return this._children[key];
    }

    @modelStatus(
        ModelStatus.MOUNTED,
        ModelStatus.INITED
    )
    public set<K extends keyof C>(
        key: K, 
        child: C[K]
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
    public remove(key: keyof C) {
        const child = this._children[key];
        delete this._children[key];
        child.unmount();
    }

    public serialize(): DictChunk<M, R, S, E, H, C> {
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
