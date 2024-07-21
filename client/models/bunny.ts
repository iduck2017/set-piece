import { BunnyDef } from "../types/bunny";
import { GenderType } from "../types/common";
import { ComnConf } from "../types/config";
import { ModelId } from "../types/registry";
import { Random } from "../utils/random";
import { Model } from "./base";

export class BunnyModel extends Model<BunnyDef> {
    constructor(conf: ComnConf<BunnyDef>) {
        super({
            ...conf,
            key : conf.key,
            list: conf.list || [],
            dict: {},
            rule: {},
            info: {},
            stat: {
                age   : 0,
                weight: Random.number(50, 100),
                gender: Random.type(GenderType.FEMALE, GenderType.MALE),
                ...conf.stat
            },
            event: {}
        });
        this.debug.eat = this.eat.bind(this);
    }

    public eat() {
        console.log('eat');
        this.$calc.stat.weight += Random.number(1, 5);
    }

    public spawn() {
        console.log('spawn');
        const child = this.app.fact.unseq<BunnyModel>({
            id    : ModelId.BUNNY,
            rule  : {},
            parent: this
        });
        this.$node.add(child);
    }
}