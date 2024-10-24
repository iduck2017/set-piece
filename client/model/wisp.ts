import { ModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import { useProduct } from "../utils/decor/product";
import { Effect } from "../utils/effect";
import { MinionModel, MinionModelDef } from "./minion";

export type WispModelDef = MinionModelDef<{
    code: 'wisp',
}>

@useProduct('wisp')
export class WispModel extends MinionModel<WispModelDef> {
    constructor(config: TmplModelConfig<WispModelDef>) {
        super({
            ...config,
            state: {
                maxHealth: 1,
                curAttack: 1,
                curHealth: 1,
                isAlive: true, 
                ...config.state,
                name: 'Wisp',
                desc: 'A small wisp that looks like a frog.'
            },
            childDict: {
            }
        });
        this.debugActionDict = {};
    }

    protected readonly _effectDict: Effect.ModelDict<WispModelDef> = {};

    public readonly actionDict: Readonly<ModelDef.ActionDict<WispModelDef>> = {};
}