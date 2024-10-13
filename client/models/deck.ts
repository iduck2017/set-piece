import { SpecModelDef } from "../configs/model-def";
import { ModelCode } from "../configs/model-code";
import { SpecModel } from "./specific";
import { ModelConfig } from "../configs/model";
import { CardModelDef } from "./card";

export type DeckModelDef = SpecModelDef<{
    code: ModelCode.Deck,
    childDict: {},
    childList: CardModelDef[]
}>


export class DeckModel extends SpecModel<DeckModelDef> {
    protected _reactDict = {};

    constructor(config: ModelConfig<DeckModelDef>) {
        super({
            ...config,
            info: {},
            childDict: {}
        });
    }
}
