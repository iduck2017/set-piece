// import { ModelStatus } from "../types/status";
// import { Model } from "./base";
// import { modelStatus } from "../utils/status";
// import { BaseRecord, BaseEvent } from "../types/base";
// import { BaseModel } from "../types/model";
// import type { App } from "../app";
// import { ListChunk, ListConfig } from "../types/list";

// export abstract class ListModel<
//     M extends number,
//     E extends BaseEvent,
//     H extends BaseEvent,
//     R extends BaseRecord,
//     I extends BaseRecord,
//     S extends BaseRecord,
//     P extends BaseModel | App,
//     C extends BaseModel
// > extends Model<M, E, H, R, I, S, P> {
//     private _children: C[] = [];
//     public get children() { return [...this._children]; }

//     constructor(config: ListConfig<M, E, H, R, I, S, C>) {
//         super(config);
//         this._children = config.children;
//     }
    
//     @modelStatus(ModelStatus.MOUNTED)
//     public get(index: number) {
//         return this._children[index];
//     }
    
//     @modelStatus(ModelStatus.MOUNTED)
//     public add(child: C) {
//         this._children.push(child);
//         child.mount(this.app, this);
//     }

//     @modelStatus(ModelStatus.MOUNTED)
//     public remove(index: number) {
//         const child = this._children[index];
//         this._children.splice(index, 1);
//         child.unmount();
//     }
    
//     public serialize(): ListChunk<M, E, H, R, S, C> {
//         const result = super.serialize();
//         const children: any[] = [];
//         for (const child of this._children) {
//             children.push(child.serialize());
//         }
//         return {
//             ...result,
//             children
//         };
//     }
// } 

