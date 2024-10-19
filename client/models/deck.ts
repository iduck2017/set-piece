import { TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
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

    constructor(config: TmplModelConfig<DeckModelDef>) {
        super({
            ...config,
            info: {},
            childDict: {}
        });
    }
}
