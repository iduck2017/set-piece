import { Model } from "../model";
import { storeRegistry } from "./store-registry";
import { stateRegistry } from "../state/state-registry";
import { childRegistry } from "../child/child-registry";
import { refRegistry } from "../ref/ref-registry";
import { useBlink } from "../hooks/use-blink";

type ModelList = Array<Model | undefined>;
type ModelValue = Model | ModelList | undefined;

/**
 * Serializes and restores models through registered store metadata.
 */
class StoreService {
    /**
     * Serialize registered state, owned children, and reference UUIDs.
     *
     * @param model - Model instance to serialize.
     * @returns Plain object containing uuid, type, and persistent fields.
     */
    public save(model: Model): Record<string, any> {
        const ModelCtor: any = model.constructor
        const config: Record<string, any> = {
            uuid: model.uuid,
            type: storeRegistry.query(ModelCtor),
        };
        const states = stateRegistry.query(model);
        for (const key of states) {
            config[key] = Reflect.get(model, key);
        }

        /** Preserve child field shapes and array slots. */
        const children = childRegistry.query(model);
        for (const key of children.keys()) {
            const value: ModelValue = Reflect.get(model, key);
            if (value instanceof Array) {
                config[key] = value.map(child => {
                    if (child === undefined) return child;
                    return this.save(child);
                });
            }
            else if (value) config[key] = this.save(value);
        }

        /** Store reference UUIDs without duplicating models. */
        const refs = refRegistry.query(model);
        for (const key of refs) {
            const value: ModelValue = Reflect.get(model, key);
            if (value instanceof Array) {
                config[key] = value.map(ref => ref?.uuid);
            } 
            else config[key] = value?.uuid;
        }
        return config;
    }

    /**
     * Recreate a model instance from a serialized store payload.
     *
     * Restore the owned tree first, then bind refs by persisted UUID.
     * One blink defers initialization until all assignments are complete.
     *
     * @param config - Serialized model payload.
     * @returns Restored model, or undefined when unavailable.
     */
    @useBlink()
    public load(config: any): Model | undefined {
        const models = new Map<string, Model>();
        const model = this.generate(config, models);
        this.bind(config, models);
        return model;
    }

    /** Build owned models and index them by persisted UUID. */
    private generate(
        config: any,
        models: Map<string, Model>
    ): Model | undefined {
        if (!config) return;
        if (typeof config !== "object") return;
        if (typeof config.type !== "string") return;
        if (typeof config.uuid !== "string") return;
        
        const code: string = config.type;
        const ModelCtor = storeRegistry.query(code);
        if (!ModelCtor) return;

        const model = new ModelCtor();
        model._internal.restore(config.uuid);
        models.set(model.uuid, model);

        const states = stateRegistry.query(model);
        for (const key of states) {
            Reflect.set(model, key, config[key]);
        }

        const children = childRegistry.query(model);
        for (const key of children.keys()) {
            const child = config[key];
            let next: ModelValue;
            if (child instanceof Array) {
                next = child.map(item => {
                    return this.generate(item, models);
                });
            }
            else next = this.generate(child, models);
            Reflect.set(model, key, next);
        }
        return model;
    }

    /** Bind references after every owned model has been generated. */
    private bind(
        config: any,
        models: Map<string, Model>
    ) {
        if (!config) return;
        if (typeof config !== "object") return;
        const model = models.get(config.uuid);
        if (!model) return;

        const refs = refRegistry.query(model);
        for (const key of refs) {
            const ref = config[key];
            const next = ref instanceof Array
                ? ref.map(uuid => models.get(uuid))
                : models.get(ref);
            Reflect.set(model, key, next);
        }

        const children = childRegistry.query(model);
        for (const key of children.keys()) {
            const child = config[key];
            if (child instanceof Array) {
                child.forEach(item => this.bind(item, models));
            }
            else this.bind(child, models);
        }
    }
}

export const storeService = new StoreService();
