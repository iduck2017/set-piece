import { ModelDef, TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";
import { Effect } from "../utils/effect";

export type CardModelDef = TmplModelDef<{
    code: 'card',
}>

@useProduct('card')
export class CardModel extends Model<CardModelDef> {
    protected readonly _effectDict: Effect.ModelDict<CardModelDef> = {};
    public readonly actionDict: Readonly<ModelDef.ActionDict<CardModelDef>> = {};

    constructor(config: TmplModelConfig<CardModelDef>) {
        super({
            ...config,
            state: {},
            childDict: {}
        });
    }
}