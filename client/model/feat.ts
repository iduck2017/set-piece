import { ModelDef, TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";
import { Effect } from "../utils/effect";

export type FeatModelDef = TmplModelDef<{
    code: 'feat',
}>

@useProduct('feat')
export class FeatModel extends Model<FeatModelDef> {
    constructor(config: TmplModelConfig<FeatModelDef>) {
        super({
            ...config,
            state: {},
            childDict: {}
        });
        this.debugActionDict = {};
    }

    protected readonly _effectDict: Effect.ModelDict<FeatModelDef> = {};

    public readonly actionDict: Readonly<ModelDef.ActionDict<FeatModelDef>> = {};
}