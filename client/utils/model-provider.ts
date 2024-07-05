import { Model } from "../models/base";
import { BaseEvent } from "../types/base";
import { BaseModel } from "../types/model";
import { Provider } from "./provider";

export class ModelProvider<
    E extends BaseEvent
> extends Provider<E, BaseModel> {
    public _serialize() {
        const provider: { [K in keyof E]?: string[] } = {};

        for (const key in this._consumers) {
            if (!provider[key]) {
                provider[key] = [];
            }
            const list = this._consumers[key];
            if (list) {
                for (const item of list) {
                    const container = item.container;
                    if (container instanceof Model) {
                        provider[key]!.push(container.referId);
                    }
                }
            }
        }

        return provider;
    }
}