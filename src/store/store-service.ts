import { Model } from "../model";
import { storeRegistry } from "./store-registry";
import { storeRowRegistry } from "./store-row-registry";

class StoreService {
    public save(model: Model) {
        const config: Record<string, any> = {}
        config.uuid = model.uuid;
        const Constructor: any = model.constructor
        config.type = storeRegistry.getCode(Constructor);
        const rowConfigMap = storeRowRegistry.query(Constructor);
        for (const [key, [, generator]] of rowConfigMap) {
            config[key] = generator((model as any)[key]);
        }
        return config;
    }

    public load(config: any) {

    }
}

export const storeService = new StoreService();
