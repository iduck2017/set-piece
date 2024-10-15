import { SpecModelDef } from "../types/model-def";
import { ModelCode } from "../types/model-code";
import { SpecModel } from "./specific";
import { ModelConfig } from "../types/model";

export type CardModelDef = SpecModelDef<{
    code: ModelCode.Card,
}>


export class CardModel extends SpecModel<CardModelDef> {
    protected _reactDict = {};

    constructor(config: ModelConfig<CardModelDef>) {
        super({
            ...config,
            info: {},
            childDict: {}
        });
    }
}