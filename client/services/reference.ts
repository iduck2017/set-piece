import type { App } from "../app";
import type { PureModel } from "../models";
import { ModelDef } from "../type/model-def";
import { singleton } from "../utils/singleton";

export const MIN_TICKET = 100000;
export const MAX_TICKET = 999999;

@singleton
export class ReferenceService {
    public readonly app: App;
    private modelDict: Record<string, PureModel> = {};

    public get ticket(): string {
        let now = Date.now();
        const ticket = this._ticket;
        this._ticket += 1;
        if (this._ticket > MAX_TICKET) {
            this._ticket = MIN_TICKET;
            while (now === this._timestamp) now = Date.now();
            this._timestamp = now;
        }
        return ticket.toString(16) + now.toString(16);
    }

    constructor(app: App) {
        this.app = app;
        this._timestamp = Date.now();
        this._ticket = MIN_TICKET;
        this.modelDict = {};
    }

    private _timestamp: number; 
    private _ticket: number;

    public reset() {
        this._timestamp = Date.now();
        this._ticket = MIN_TICKET;
        this.modelDict = {};
    }


    public registerModel(model: PureModel) {
        this.modelDict[model.id] = model;
    }

    public unregisterModel<M extends ModelDef>(model: PureModel<M>) {
        delete this.modelDict[model.id];
    }

    public findModel(modelId: string): PureModel | undefined {
        return this.modelDict[modelId];
    }

}


