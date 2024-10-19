import { TmplModelDef } from "../types/model-def";
import { ModelConfig } from "../types/model";
import { CardModelDef } from "./card";
import { Model } from ".";
import { useProduct } from "../utils/product";

export type DeckModelDef = TmplModelDef<{
    code: 'deck',
    childDict: {},
    childList: CardModelDef[]
}>

@useProduct('deck')
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
