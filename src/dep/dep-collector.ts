import { Field } from "../utils/field-registry";

class DepCollector {
    private _context: Map<Field, Field[]> = new Map();

    public collect(dep: Field) {
        this._context.forEach((producers) => {
            if (producers.includes(dep)) return;
            producers.push(dep);
        })
    }

    public init(depConsumer: Field) {
        const producers = this._context.get(depConsumer) ?? [];
        this._context.set(depConsumer, producers);
    }

    public query(depConsumer: Field) {
        return this._context.get(depConsumer) ?? [];
    }

    public clear(depConsumer: Field) {
        this._context.delete(depConsumer);
    }
}


export const depCollector = new DepCollector();