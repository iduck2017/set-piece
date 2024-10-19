import { TmplModelDef } from "../types/model-def";
import { ModelCode } from "../types/model-code";
import { ModelConfig } from "../types/model";
import { CardModelDef } from "./card";
import { Model } from ".";

export type DeckModelDef = TmplModelDef<{
    code: ModelCode.Deck,
    childDict: {},
    childList: CardModelDef[]
}>


export class DeckModel extends Model<DeckModelDef> {
    protected _reactDict = {};
    public intf = {};

    constructor(config: ModelConfig<DeckModelDef>) {
        super({
            ...config,
            info: {},
            childDict: {}
        });
    }
}
