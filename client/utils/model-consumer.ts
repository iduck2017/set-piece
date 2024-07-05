import { Model } from "../models/base";
import { BaseEvent } from "../types/base";
import { BaseModel } from "../types/model";
import { Consumer } from "./consumer";

export class ModelConsumer<
    H extends BaseEvent
> extends Consumer<H, BaseModel> {
    public _serialize() {
        const consumer: { [K in keyof H]?: string[] } = {};

        for (const key in this._providers) {
            if (!consumer[key]) {
                consumer[key] = [];
            }
            const list = this._providers[key];
            if (list) {
                for (const item of list) {
                    const container = item.container;
                    if (container instanceof Model) {
                        consumer[key]!.push(container.referId);
                    }
                }
            }
        }

        return consumer;
    }
}