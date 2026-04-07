import { depResolver } from "../dep/dep-resolver";
import { Field } from "../utils/field-registry"
import { stateDelegator } from "./state-delegator";

class StateResolver {
    private _context: Set<Field> = new Set();

    public register(depProducer: Field) {
        this._context.add(depProducer);
    }

    public resolve() {
        const stateMemory: Map<Field, any> = new Map();
        this._context.forEach(decorProducerField => {
            const [decorProducer, key] = decorProducerField;
            const prev = Reflect.get(decorProducer, key);
            stateMemory.set(decorProducerField, prev);
            stateDelegator.clear(decorProducerField);
        });
        this._context.forEach(decorProducerField => {
            const [decorProducer, key] = decorProducerField;
            const next = Reflect.get(decorProducer, key);
            const prev = stateMemory.get(decorProducerField);
            if (prev === next) stateMemory.delete(decorProducerField);
        });
        this._context.clear();
        stateMemory.forEach((_value, decorProducerField) => {
            depResolver.resolve(decorProducerField);
        });
    }
}

export const stateResolver = new StateResolver();
