import { trxManager } from "../trx/trx-manager";
import { effectManager } from "./effect-manager";
import { Field } from "../utils/field-registry";
import { depManager } from "../dep/dep-manager";

class EffectResolver {
    private _context: Field[] = [];

    public register(dep: Field) {
        trxManager.run(() => {
            if (this._context.includes(dep)) return;
            this._context.push(dep);
        })
    }

    public resolve() {
        const deps = this._context;
        this._context = [];

        // Get memos
        const effectFields: Field[] = [];
        for (const dep of deps) {
            const subEffectFields = effectManager.query(dep);
            subEffectFields.forEach(effectField => {
                if (effectFields.includes(effectField)) return;
                effectFields.push(effectField);
                if (deps.includes(effectField)) return;
                deps.push(effectField);
            })
        }

        // Clear relations
        effectFields.forEach(effectField => {
            const deps = depManager.query(effectField);
            effectManager.unbind(effectField);
            deps.forEach(dep => depManager.unbind(effectField, dep))
        })

        // Re-run effects
        effectFields.forEach(effectField => {
            const [model, key] = effectField;
            console.log('Re-run effect', model.name, key);
            const effect = Reflect.get(model, key);
            if (effect instanceof Function) effect.call(model);
        })
    }
}

export const effectResolver = new EffectResolver();
