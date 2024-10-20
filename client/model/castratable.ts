import { TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import { BunnyModel, BunnyModelDef } from "./bunny";
import { Event } from "../type/event";
import { Random } from "../utils/random";
import { AnimalFeaturesModel } from "./animal-feature";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";

/** 可阉割的 */
export type CastratableModelDef = TmplModelDef<{
    code: 'castratable',
    info: {
        /** 是否已经阉割 */
        castrated: boolean,
        /** 阉割造成的预期寿命加成 */
        maxAgeBonus: number
    },
    signalDict: {
        /** 被阉割前 */
        castrateBefore: Event.PreCastrated<BunnyModel>,
        /** 被阉割后 */
        castrateDone: Event.Castrated<BunnyModel>
    }
    effectDict: {
        ageUpdateBefore: Event.StateAlter<BunnyModelDef, number>
    },
    parent: AnimalFeaturesModel
}>

@useProduct('castratable')
export class CastratableModel extends Model<CastratableModelDef> {

    /** 预期寿命修饰符 */
    private readonly _handleAgeUpdateBefore = (
        signal: Event.StateAlter<BunnyModelDef, number>
    ): Event.StateAlter<BunnyModelDef, number> => {
        return {
            ...signal,
            next: signal.next + this.actualInfo.maxAgeBonus
        };
    };

    protected _effectDict = this._initEffectDict({
        ageUpdateBefore: this._handleAgeUpdateBefore
    });

    constructor(config: TmplModelConfig<CastratableModelDef>) {
        super({
            ...config,
            info: {
                castrated: config.info?.castrated || false,
                maxAgeBonus: config.info?.maxAgeBonus || Random.number(0, 25)
            },
            childDict: {}
        });
    }

    protected readonly _active = () => {
        if (this.actualInfo.castrated) {
            const animal = this.parent?.parent;
            animal.checkSignalDict.maxAge.bindEffect(
                this._effectDict.ageUpdateBefore
            );
        }
    };


    /** 执行阉割 */
    public readonly castrate = () => {
        if (this.actualInfo.castrated) return;
        const animal = this.parent?.parent;
        const result = this._signalDict.castrateBefore.emitSignal({
            model: animal
        });
        if (result?.isAborted)  return;
        this._originInfo.castrated = true;
        animal.checkSignalDict.maxAge.bindEffect(
            this._effectDict.ageUpdateBefore
        );
        this._signalDict.castrateDone.emitSignal({ model: animal });
    };

    
    public readonly methodDict = {};
}
