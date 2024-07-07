/* eslint-disable import/no-cycle */

import type { Model } from "../models/base";
import { BaseRecord } from "../types/base";
import { 
    BaseDict, 
    BaseEvent, 
    BaseList, 
    BaseModel 
} from "../types/model";
import { Consumer } from "./consumer";
import { ModelProvider } from "./model-provider";

export class ModelConsumer<
    H extends BaseEvent
> extends Consumer<H> {
    private _container?: BaseModel;
    public get container(): BaseModel {
        const result = this._container;
        if (!result) {
            throw new Error();
        }
        return result;
    }
    
    private _raw: { [K in keyof H]?: string[] };

    constructor(config: {
        raw: { [K in keyof H]?: string[] }, 
        handlers: H
    }) {
        super(config);
        this._raw = config.raw;
    }

    public _mount(options: { 
        container: BaseModel; 
    }) {
        this._container = options.container;
        const app = options.container.app;
        
        for (const key in this._raw) {
            const list = this._raw[key];
            if (list) {
                for (const id of list) {
                    const model = app.refer.get<
                        Model<
                            number,
                            BaseRecord,
                            BaseRecord,
                            BaseRecord,
                            any,
                            BaseEvent,
                            BaseModel,
                            BaseList,
                            BaseDict
                        >
                    >(id);
                    if (model) {
                        model.provider.bind(key, this);
                    }
                }
            }
        }
    }

    public _serialize() {
        const consumer: { [K in keyof H]?: string[] } = {};

        for (const key in this._providers) {
            if (!consumer[key]) {
                consumer[key] = [];
            }
            const list = this._providers[key];
            if (list) {
                for (const item of list) {
                    if (item instanceof ModelProvider) {
                        const container = item.container;
                        consumer[key]!.push(container.referId);
                    }
                }
            }
        }

        return { consumer };
    }
}