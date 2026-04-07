import { Decor } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Field } from "../utils/field-registry";

export type DecorTypesMapByProducer = Map<Model, Array<Constructor<Decor>>>
class DecorProducerManager {
    private _context: WeakMap<Field, DecorTypesMapByProducer> = new WeakMap();

    public bind(
        decorConsumerField: Field,
        decorProducer: Model,
        decorType: Constructor<Decor>,
    ) {
        const subContext: DecorTypesMapByProducer = this._context.get(decorConsumerField) ?? new Map();
        const decorTypes = subContext.get(decorProducer) ?? [];
        if (decorTypes.includes(decorType)) return;
        decorTypes.push(decorType);
        subContext.set(decorProducer, decorTypes);
        this._context.set(decorConsumerField, subContext);
    }

    public unbind(decorConsumerField: Field) {
        this._context.delete(decorConsumerField);
    }

    public query(decorConsumerField: Field): DecorTypesMapByProducer {
        return this._context.get(decorConsumerField) ?? new Map();
    }
}

export const decorProducerManager = new DecorProducerManager();
