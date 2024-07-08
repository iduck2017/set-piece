import { ModelId } from "../types/registry";
import { product } from "../utils/product";
import { BunnyModel } from "./bunny";
import { Model } from "./base";
import { RootConf, RootTmpl } from "../types/root";

@product(ModelId.ROOT)
export class RootModel extends Model<RootTmpl> {
    constructor(config: RootConf) {
        super({
            referId: config.referId,
            modelId: ModelId.ROOT,
            rule: config.rule,
            info: {},
            stat: {
                progress: 0,
                ...config.stat
            },
            emitter: config.emitter || {},
            handler: config.handler || {},
            list: [],
            dict: {
                bunny: config.dict?.bunny || new BunnyModel({ rule: {} })
            },
            intf: {}
        });
    }
}