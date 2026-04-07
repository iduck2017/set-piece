import { Model } from "../model";
import { Decor } from ".";
import { decorConsumerManager } from "./decor-consumer-manager";

class DecorEmitter {
    public emit(model: Model, decor: Decor) {
        const decorConsumerFields = decorConsumerManager.query(model, decor);
        decorConsumerFields.forEach(decorConsumerField => {
            const [decorConsumer, decorConsumerKey] = decorConsumerField;
            const handler = Reflect.get(decorConsumer, decorConsumerKey);
            if (handler instanceof Function) {
                handler.call(decorConsumer, decor);
            }
        });
    }
}

export const decorEmitter = new DecorEmitter();
