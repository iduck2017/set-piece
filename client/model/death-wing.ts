import { ModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import { useProduct } from "../utils/decor/product";
import { Effect } from "../utils/effect";
import { MinionModel, MinionModelDef } from "./minion";
import { FeatModelDef } from "./feat";

export type DeathWingModelDef = MinionModelDef<{
    code: 'death_wing',
    childDict: {
        feat: FeatModelDef
    }
}>

@useProduct('death_wing')
export class DeathWingModel extends MinionModel<DeathWingModelDef> {
    constructor(config: TmplModelConfig<DeathWingModelDef>) {
        super({
            ...config,
            state: {
                maxHealth: 12,
                curHealth: 12,
                curAttack: 12,
                isAlive: true,
                ...config.state,
                name: 'Death Wing',
                desc: 'A winged creature that looks like a skull and has a large head.'
            },
            childDict: {
                feat: { code: 'feat' }
            }
        });
        this.debugActionDict = {};
    }

    protected readonly _effectDict: Effect.ModelDict<DeathWingModelDef> = {};

    public readonly actionDict: Readonly<ModelDef.ActionDict<DeathWingModelDef>> = {};
}