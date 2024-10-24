import { ModelDef, TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";
import { Effect } from "../utils/effect";
import { CardModelDef } from "./card";

export type HandModelDef = TmplModelDef<{
    code: 'hand',
    childItem: CardModelDef,
    actionDict: {
        initCard: () => void
    }
}>

@useProduct('hand')
export class HandModel extends Model<HandModelDef> {
    constructor(config: TmplModelConfig<HandModelDef>) {
        super({
            ...config,
            state: {
            }
        });
        this.debugActionDict = {};
    }

    private readonly _initCard = () => {
        this._childList.push(this._unserialize({ code: 'wisp' }));
        this._childList.push(this._unserialize({ code: 'death_wing' }));
    };

    protected readonly _effectDict: Effect.ModelDict<HandModelDef> = {};

    public readonly actionDict: Readonly<ModelDef.ActionDict<HandModelDef>> = {
        initCard: this._initCard
    };
}