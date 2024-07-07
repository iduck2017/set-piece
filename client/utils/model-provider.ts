/* eslint-disable import/no-cycle */

import type { Model } from "../models/base";
import { 
    BaseEvent, 
    BaseModel, 
    ModelEvent, 
    ModelTmpl
} from "../types/model";
import { ModelConsumer } from "./model-consumer";
import { Provider } from "./provider";

export class ModelProvider<
    E extends BaseEvent
> extends Provider<ModelEvent<E>> {
    private _container?: BaseModel;
    public get container(): BaseModel {
        const result = this._container;
        if (!result) {
            throw new Error();
        }
        return result;
    }

    private _raw: { [K in keyof ModelEvent<E>]?: string[] };

    constructor(config: {
        raw: { [K in keyof ModelEvent<E>]?: string[] } 
    }) {
        super();
        this._raw = config.raw;
    }

    public _mount(options: {
        container: BaseModel
    }) {
        this._container = options.container;

        const app = options.container.app;
        for (const key in this._raw) {
            const list = this._raw[key];
            if (list) {
                for (const id of list) {
                    const model = app.refer.get<
                        Model<ModelTmpl<{ [8]: ModelEvent<E> }>>
                    >(id);
                    if (model) {
                        this.bind(key, model.consumer);
                    }
                }
            }
        }
    }

    public _serialize() {
        const provider: { [K in keyof ModelEvent<E>]?: string[] } = {};

        for (const key in this._consumers) {
            if (!provider[key]) {
                provider[key as keyof E] = [];
            }
            const list = this._consumers[key];
            if (list) {
                for (const item of list) {
                    if (item instanceof ModelConsumer) {
                        const container = item.container;
                        provider[key]!.push(container.referId);
                    }
                }
            }
        }

        return { provider };
    }
}