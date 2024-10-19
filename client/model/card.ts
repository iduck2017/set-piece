import { TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";

export type CardModelDef = TmplModelDef<{
    code: 'card',
}>

@useProduct('card')
export class CardModel extends Model<CardModelDef> {
    protected _reactDict = {};

    constructor(config: TmplModelConfig<CardModelDef>) {
        super({
            ...config,
            info: {},
            childDict: {}
        });
    }
    
    public readonly intf = {};
}