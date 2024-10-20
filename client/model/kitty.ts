import { ModelDef, TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";
import { Effect } from "../utils/effect";

export type KittyModelDef = TmplModelDef<{
    code: 'kitty',
}>

@useProduct('kitty')
export class KittyModel extends Model<KittyModelDef> {
    protected readonly _effectDict: Effect.ModelDict<KittyModelDef> = {};
    public readonly methodDict: Readonly<ModelDef.MethodDict<KittyModelDef>> = {};

    constructor(config: TmplModelConfig<KittyModelDef>) {
        super({
            ...config,
            state: {},
            childDict: {}
        });
    }
}