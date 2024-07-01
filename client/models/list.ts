import { ModelStatus } from "../types/status";
import { Model } from "./base";
import { modelStatus } from "../utils/status";
import { BaseData } from "../types/base";
import { BaseModel, ChunkOf } from "../types/model";
import type { App } from "../app";
import { ListChunk, ListConfig } from "../types/list";
import { ModelId } from "../types/registry";
import { EventId } from "../types/events";

export abstract class ListModel<
    M extends ModelId,
    E extends EventId,
    H extends EventId,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    P extends BaseModel | App,
    C extends BaseModel
> extends Model<M, E, H, R, I, S, P> {
    private _children: C[] = [];
    public get children() { return [...this._children]; }

    constructor(
        config: ListConfig<M, E, H, R, I, S, C>,
        app: App
    ) {
        super(config, app);
        this._children = config.children;
    }
    
    @modelStatus(ModelStatus.MOUNTED)
    public get(index: number) {
        return this._children[index];
    }
    
    @modelStatus(ModelStatus.MOUNTED)
    public add(child: C) {
        this._children.push(child);
        child.mount(this);
    }

    @modelStatus(ModelStatus.MOUNTED)
    public remove(index: number) {
        const child = this._children[index];
        this._children.splice(index, 1);
        child.unmount();
    }
    
    public serialize(): ListChunk<M, E, H, R, S, C> {
        const result = super.serialize();
        const children: any[] = [];
        for (const child of this._children) {
            children.push(child.serialize());
        }
        return {
            ...result,
            children
        };
    }
} 

