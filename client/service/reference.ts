// import type { App } from "../app";
// import { Model } from "../model";
// import { useSingleton } from "../utils/decor/singleton";

// export const MIN_TICKET = 100;
// export const MAX_TICKET = 999;

// @useSingleton
// export class ReferenceService {
//     public readonly app: App;
//     private modelDict: Record<string, any> = {};

//     public get ticket(): string {
//         let now = Date.now();
//         const ticket = this._ticket;
//         this._ticket += 1;
//         if (this._ticket > MAX_TICKET) {
//             this._ticket = MIN_TICKET;
//             while (now === this._timestamp) {
//                 now = Date.now();
//             }
//         }
//         this._timestamp = now;
//         return now.toString(36) + ticket.toString(36);
//     }

//     constructor(app: App) {
//         this.app = app;
//         this._timestamp = Date.now();
//         this._ticket = MIN_TICKET;
//         this.modelDict = {};
//     }

//     private _timestamp: number; 
//     private _ticket: number;

//     public reset() {
//         this._timestamp = Date.now();
//         this._ticket = MIN_TICKET;
//         this.modelDict = {};
//     }

//     public registerModel(model: any) {
//         this.modelDict[model.mid] = model;
//     }

//     public unregisterModel(model: any) {
//         delete this.modelDict[model.mid];
//     }

//     public findModel(modelId: string): Model | undefined {
//         return this.modelDict[modelId];
//     }

// }


