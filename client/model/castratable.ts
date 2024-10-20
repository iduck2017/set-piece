import { TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import { BunnyModel, BunnyModelDef } from "./bunny";
import { Random } from "../utils/random";
import { AnimalFeaturesModel } from "./animal-feature";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";
import { Event } from "../type/event";

/** 可阉割的 */
export type CastratableModelDef = TmplModelDef<{
    code: 'castratable',
    state: {
        /** 是否已经阉割 */
        castrated: boolean,
        /** 阉割造成的预期寿命加成 */
        maxAgeBonus: number
    },
    signalDict: {
        /** 被阉割前 */
        castrateBefore: {
            model: BunnyModel,
            isBreak?: boolean
        },
        /** 被阉割后 */
        castrateAfter: {
            model: BunnyModel,
        }
    }
    effectDict: {
        ageUpdateBefore: Event.StateEditor<BunnyModelDef, number>
    },
    parent: AnimalFeaturesModel
}>

@useProduct('castratable')
export class CastratableModel extends Model<CastratableModelDef> {

    /** 预期寿命修饰符 */
    private readonly _handleAgeUpdateBefore = (
        signal: Event.StateEditor<BunnyModelDef, number>
    ): Event.StateEditor<BunnyModelDef, number> => {
        return {
            ...signal,
            next: signal.next + this.actualState.maxAgeBonus
        };
    };

    protected _effectDict = this._initEffectDict({
        ageUpdateBefore: this._handleAgeUpdateBefore
    });

    constructor(config: TmplModelConfig<CastratableModelDef>) {
        super({
            ...config,
            state: {
                castrated: config.state?.castrated || false,
                maxAgeBonus: config.state?.maxAgeBonus || Random.number(0, 25)
            },
            childDict: {}
        });
    }

    protected readonly _active = () => {
        if (this.actualState.castrated) {
            const animal = this.parent?.parent;
            animal.checkSignalDict.maxAge.bindEffect(
                this._effectDict.ageUpdateBefore
            );
        }
    };


    /** 执行阉割 */
    public readonly castrate = () => {
        if (this.actualState.castrated) return;
        const animal = this.parent?.parent;
        const result = this._signalDict.castrateBefore.emitSignal({
            model: animal
        });
        if (result?.isBreak)  return;
        this._originState.castrated = true;
        animal.checkSignalDict.maxAge.bindEffect(
            this._effectDict.ageUpdateBefore
        );
        this._signalDict.castrateAfter.emitSignal({ model: animal });
    };

    
    public readonly methodDict = {};
}
