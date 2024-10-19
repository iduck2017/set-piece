import { TmplModelDef } from "../types/model-def";
import { ModelConfig } from "../types/model";
import { Model } from ".";
import { useProduct } from "../utils/product";

export type CardModelDef = TmplModelDef<{
    code: 'card',
}>

@useProduct('card')
export class CardModel extends Model<CardModelDef> {
    protected _reactDict = {};

    constructor(config: ModelConfig<CardModelDef>) {
        super({
            ...config,
            info: {},
            childDict: {}
        });
    }
    
    public readonly intf = {};
}