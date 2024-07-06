// import { ModelStatus } from "../types/status";
// import { Model } from "./base";
// import { modelStatus } from "../utils/status";
// import { BaseData, BaseEvent } from "../types/base";
// import { BaseModel } from "../types/model";
// import type { App } from "../app";
// import { DictChunk, DictConfig } from "../types/dict";

// export abstract class DictModel<
//     M extends number,
//     E extends BaseEvent,
//     H extends BaseEvent,
//     R extends BaseData,
//     I extends BaseData,
//     S extends BaseData,
//     P extends BaseModel | App,
//     C extends Record<string, BaseModel>
// > extends Model<M, E, H, R, I, S, P> {
//     protected _children!: C;
//     public get children() { 
//         const result: BaseModel[] = [];
//         for (const key in this._children) {
//             const value = this._children[key];
//             if (value) result.push(value);
//         }
//         return result;
//     }

//     constructor(
//         config: DictConfig<M, E, H, R, I, S, C>
//     ) {
//         super(config);
//         this._children = config.children;
//     }

//     @modelStatus(ModelStatus.MOUNTED)
//     public get<K extends keyof C>(
//         key: K
//     ): C[K] {
//         return this._children[key];
//     }

//     @modelStatus(ModelStatus.MOUNTED)
//     public set<K extends keyof C>(
//         key: K, 
//         child: C[K]
//     ) {
//         if (this._children[key]) { 
//             throw new Error();
//         }
//         this._children[key] = child;
//         child.mount(this.app, this);
//     }

//     @modelStatus(ModelStatus.MOUNTED)
//     public remove(key: keyof C) {
//         const child = this._children[key];
//         delete this._children[key];
//         child.unmount();
//     }

//     public serialize(): DictChunk<M, E, H, R, S, C> {
//         const result = super.serialize();
//         const children = {} as any;
//         for (const key in this._children) {
//             children[key] = this._children[key].serialize();
//         }
//         return {
//             ...result,
//             children
//         };
//     }

// } 
