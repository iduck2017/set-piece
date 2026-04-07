import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { Field } from "../utils/field-registry";
import { decorManager } from "./decor-manager";
import { decorProducerManager } from "./decor-producer-manager";
import { decorConsumerManager } from "./decor-consumer-manager";
import { decorConsumerRegistry } from "./decor-consumer-registry";
import { stateManager } from "../state/state-manager";
import { decorProducerResolver } from "./decor-producer-resolver";

class DecorConsumerResolver {

    public resolve(dep: Field) {
        const deps = [dep];
        // Get affected decor fields
        const decorConsumerFields: Field[] = [];
        for (const dep of deps) {
            const subDecorConsumerFields = decorManager.query(dep);
            subDecorConsumerFields.forEach(decorConsumerField => {
                if (decorConsumerFields.includes(decorConsumerField)) return;
                decorConsumerFields.push(decorConsumerField);
                if (deps.includes(decorConsumerField)) return;
                deps.push(decorConsumerField);
            });
        }

        // Clear relations
        decorConsumerFields.forEach(decorConsumerField => {
            const deps = depManager.query(decorConsumerField);
            decorManager.unbind(decorConsumerField);
            deps.forEach(dep => {
                depManager.unbind(decorConsumerField, dep);
            });
        });

        decorConsumerFields.forEach(decorConsumerField => {
            this.unbind(decorConsumerField);
            this.bind(decorConsumerField);
        });
        decorProducerResolver.resolve()
    }

    public unbind(decorConsumerField: Field) {
        const decorProducers = decorProducerManager.query(decorConsumerField);
        decorProducers.forEach((decorTypes, decorProducer) => {
            decorTypes.forEach(decorType => {
                decorConsumerManager.unbind(decorProducer, decorType, decorConsumerField);
                decorProducerResolver.register(decorProducer, decorType);
            });
        });
        decorProducerManager.unbind(decorConsumerField);
    }

    public bind(decorConsumerField: Field) {
        const [decorConsumer, decorConsumerKey] = decorConsumerField;
        const loadersMap = decorConsumerRegistry.query(decorConsumer);
        const loaders = loadersMap.get(decorConsumerKey) ?? [];
        loaders.forEach(loader => {
            const [decorProducers, decorType] = loader(decorConsumer);
            if (decorProducers instanceof Array) {
                decorProducers.forEach(model => {
                    if (!model) return;
                    decorConsumerManager.bind(model, decorType, decorConsumerField);
                    decorProducerManager.bind(decorConsumerField, model, decorType);
                    decorProducerResolver.register(model, decorType);
                });
            }
            if (decorProducers instanceof Model) {
                decorConsumerManager.bind(decorProducers, decorType, decorConsumerField);
                decorProducerManager.bind(decorConsumerField, decorProducers, decorType);
                decorProducerResolver.register(decorProducers, decorType);
            }
        });
    }
}

export const decorConsumerResolver = new DecorConsumerResolver();
