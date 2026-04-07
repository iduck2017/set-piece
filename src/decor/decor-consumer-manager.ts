import { Decor } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Field } from "../utils/field-registry";

export type DecorConsumerFieldsMapByType = Map<Constructor<Decor>, Array<Field>>
class DecorConsumerManager {
    private _context: WeakMap<Model, DecorConsumerFieldsMapByType>= new WeakMap();

    public bind(
        decorProducer: Model,
        decorType: Constructor<Decor>,
        decorConsumerField: Field,
    ) {
        const subContext: DecorConsumerFieldsMapByType = this._context.get(decorProducer) ?? new Map();
        const decorConsumerFields = subContext.get(decorType) ?? [];
        decorConsumerFields.push(decorConsumerField);
        subContext.set(decorType, decorConsumerFields);
        this._context.set(decorProducer, subContext);
    }

    public unbind(
        decorProducer: Model,
        decorType: Constructor<Decor>,
        decorConsumerField: Field,
    ) {
        const subContext: DecorConsumerFieldsMapByType = this._context.get(decorProducer) ?? new Map();
        const decorConsumerFields = subContext.get(decorType) ?? [];
        const index = decorConsumerFields.indexOf(decorConsumerField);
        if (index === -1) return;
        decorConsumerFields.splice(index, 1);
        subContext.set(decorType, decorConsumerFields);
        this._context.set(decorProducer, subContext);
    }

    public query(decorProducer: Model): Map<Constructor<Decor>, Array<Field>>
    public query(decorProducer: Model, decor: Decor): Array<Field>
    public query(
        decorProducer: Model,
        decor?: Decor,
    ) {
        if (!decor) return this._context.get(decorProducer) ?? new Map();
        const decorType: any = decor.constructor;
        const subContext: DecorConsumerFieldsMapByType = this._context.get(decorProducer) ?? new Map();
        const decorConsumerFields = subContext.get(decorType) ?? [];
        return decorConsumerFields;
    }
}
export const decorConsumerManager = new DecorConsumerManager();
