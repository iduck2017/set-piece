import { TmplModelDef } from "../types/model-def";
import { ModelCode } from "../types/model-code";
import { ModelConfig } from "../types/model";
import { Model } from ".";

export type CardModelDef = TmplModelDef<{
    code: ModelCode.Card,
}>


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