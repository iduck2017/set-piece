import { ModelId } from "../types/registry";
import { Model } from "./base";
import { ComnConf } from "../types/config";
import { RootDef } from "../types/root";

export class RootModel extends Model<RootDef> {
    constructor(conf: ComnConf<RootDef>) {
        super({
            ...conf,
            key : conf.key,
            info: {},
            stat: {
                progress: 0,
                ...conf.stat
            },
            list: [],
            dict: {
                bunny: conf.dict?.bunny || {
                    id  : ModelId.BUNNY,
                    rule: {}
                }
            },
            event: {}
        });
    }
}