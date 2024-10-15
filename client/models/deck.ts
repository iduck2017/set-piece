import { SpecModelDef } from "../types/model-def";
import { ModelCode } from "../types/model-code";
import { SpecModel } from "./specific";
import { ModelConfig } from "../types/model";
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
