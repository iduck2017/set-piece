import { ModelStatus } from "../types/status";
import { Model } from "./base";
import { modelStatus } from "../utils/status";
import { BaseData, VoidData } from "../types/base";
import { BaseModel } from "../types/model";
import type { App } from "../app";
import { ListChunk, ListConfig } from "../types/list";

export abstract class ListModel<
    M extends number,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    E extends Record<string, BaseModel[]>,
    H extends Record<string, BaseModel[]>,
    P extends BaseModel | App,
    C extends BaseModel
> extends Model<M, R, I, S, E, H, P> {
    private _children: C[] = [];
    public get children() { return [...this._children]; }

    constructor(config: ListConfig<M, R, I, S, E, H, C>) {
        super(config);
        for (const child of config.children) {
            this.add(child);
        }
    }
    
    @modelStatus(ModelStatus.MOUNTED)
    public get(index: number) {
        return this._children[index];
    }
    
    @modelStatus(
        ModelStatus.MOUNTED,
        ModelStatus.INITED
    )
    public add(child: C) {
        this._children.push(child);
        child.mount(this);
    }

    @modelStatus(
        ModelStatus.MOUNTED,
        ModelStatus.INITED
    )
    public remove(index: number) {
        const child = this._children[index];
        this._children.splice(index, 1);
        child.unmount();
    }
    
    public serialize(): ListChunk<M, R, S, E, H, C> {
        const result = super.serialize();
        return {
            ...result,
            children: this._children.map(item => {
                return item.serialize();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }) as any
        };
    }
} 

