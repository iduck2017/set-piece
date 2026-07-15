import { Model } from "../model";
import { storeRegistry } from "./store-registry";
import { storeRowRegistry } from "./store-row-registry";

/**
 * Serializes and restores models through registered store metadata.
 */
class StoreService {
    /**
     * Serialize a model instance using its registered code and row configs.
     *
     * @param model - Model instance to serialize.
     * @returns Plain object containing uuid, type, and registered rows.
     */
    public save(model: Model) {
        const config: Record<string, any> = {}
        config.uuid = model.uuid;
        const ModelCtor: any = model.constructor
        config.type = storeRegistry.query(ModelCtor);
        const rows = storeRowRegistry.query(ModelCtor);
        for (const [key, [, generator]] of rows) {
            config[key] = generator((model as any)[key]);
        }
        return config;
    }

    /**
     * Recreate a model instance from a serialized store payload.
     *
     * This is currently a placeholder for future load support.
     *
     * @param config - Serialized model payload.
     * @returns Nothing at the moment.
     */
    public load(config: any) {
        
    }
}

export const storeService = new StoreService();
