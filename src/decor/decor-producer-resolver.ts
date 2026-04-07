import { Decor } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { stateManager } from "../state/state-manager";
import { stateResolver } from "../state/state-resolver";

class DecorProducerResolver {
    public register(decorProducer: Model, decorType: Constructor<Decor>) {
        if (!decorType) return;
        const decorProducerFields = stateManager.query(decorProducer, decorType);
        decorProducerFields.forEach(decorProducerField => {
            stateResolver.register(decorProducerField);
        });
    }

    public resolve() {
        stateResolver.resolve();
    }
}

export const decorProducerResolver = new DecorProducerResolver();
