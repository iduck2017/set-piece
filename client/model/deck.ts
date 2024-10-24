import { TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import { CardModelDef } from "./card";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";

export type DeckModelDef = TmplModelDef<{
    code: 'deck',
    childDict: {},
    childItem: CardModelDef,
    effectDict: {
    },
    actionDict: {
        initCard: () => void
    }
}>

@useProduct('deck')
export class DeckModel extends Model<DeckModelDef> {
    constructor(config: TmplModelConfig<DeckModelDef>) {
        super({
            ...config,
            state: {},
            childDict: {}
        });
    }

    private readonly _initCard = (): void => {
        this._childList.push(this._unserialize({ code: 'wisp' }));
        this._childList.push(this._unserialize({ code: 'death_wing' }));
    };

    protected _effectDict = this.EffectDict({});
    
    public readonly actionDict = {
        initCard: this._initCard
    };
}
