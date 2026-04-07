import { Constructor } from "../types";
import { Decor } from "../decor";
import { Model } from "../model";
import { stateDelegator } from "./state-delegator";
import { Field, fieldRegistry } from "../utils/field-registry";

export type StateMap = Map<Constructor<Decor>, string[]>
class StateManager {
    private _context: WeakMap<Model, StateMap> = new WeakMap();

    public register(
        decorProducer: Model,
        decorType: Constructor<Decor>,
        decorProducerKey: string
    ) {
        const subContext = this._context.get(decorProducer) ?? new Map();
        const keys = subContext.get(decorType) ?? [];
        if (keys.includes(decorProducerKey)) return;
        keys.push(decorProducerKey);
        subContext.set(decorType, keys);
        this._context.set(decorProducer, subContext);
    }

    public query(
        decorProducer: Model,
        decorType: Constructor<Decor>
    ): Field[] {
        const subContext: StateMap = this._context.get(decorProducer) ?? new Map();
        const keys = subContext.get(decorType) ?? [];
        return keys?.map(key => fieldRegistry.query(decorProducer, key))
    }
}

export const stateManager = new StateManager();
