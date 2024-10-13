import { SpecModelDef } from "../configs/model-def";
import { ModelCode } from "../configs/model-code";
import { SpecModel } from "./specific";
import { ModelConfig } from "../configs/model";
import { CardModelDef } from "./card";

export type DeckDef = SpecModelDef<{
    code: ModelCode.Deck,
    childDict: {},
    childList: CardModelDef[]
}>


export class DeckModel extends SpecModel<DeckDef> {
    protected _reactDict = {};

    constructor(config: ModelConfig<DeckDef>) {
        super({
            ...config,
            info: {},
            childDict: {}
        });
    }
}
