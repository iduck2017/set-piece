import { TmplModelDef } from "../type/model/define";
import { TmplModelConfig } from "../type/model/config";
import { BunnyModel, BunnyModelDef } from "./bunny";
import { EventInfo } from "../type/event";
import { Random } from "../utils/random";
import { AnimalFeaturesModel } from "./animal-feature";
import { Model } from ".";
import { useProduct } from "../utils/product";

/** 可阉割的 */
export type CastratableModelDef = TmplModelDef<{
    code: 'castratable',
    info: {
        /** 是否已经阉割 */
        castrated: boolean,
        /** 阉割造成的预期寿命加成 */
        maxAgeBonus: number
    },
    eventDict: {
        /** 被阉割前 */
        castrateBefore: EventInfo.CastrateBefore<BunnyModel>,
        /** 被阉割后 */
        castrateDone: EventInfo.CastrateDone<BunnyModel>
    }
    reactDict: {
        ageUpdateBefore: EventInfo.StateUpdateBefore<BunnyModelDef, number>
    },
    parent: AnimalFeaturesModel
}>

@useProduct('castratable')
export class CastratableModel extends Model<CastratableModelDef> {

    /** 预期寿命修饰符 */
    private readonly _handleAgeUpdateBefore = (
        event: EventInfo.StateUpdateBefore<BunnyModelDef, number>
    ): EventInfo.StateUpdateBefore<BunnyModelDef, number> => {
        return {
            ...event,
            next: event.next + this.actualInfo.maxAgeBonus
        };
    };

    protected _reactDict = this._initReactDict({
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

    protected readonly _recover = () => {
        if (this.actualInfo.castrated) {
            const animal = this.parent?.parent;
            animal.modifyEventDict.maxAge.bindReact(
                this._reactDict.ageUpdateBefore
            );
        }
    };


    /** 执行阉割 */
    public readonly castrate = () => {
        if (this.actualInfo.castrated) return;
        const animal = this.parent?.parent;
        const result = this._eventDict.castrateBefore.emitEvent({
            model: animal
        });
        if (result?.isAborted)  return;
        this._originInfo.castrated = true;
        animal.modifyEventDict.maxAge.bindReact(
            this._reactDict.ageUpdateBefore
        );
        this._eventDict.castrateDone.emitEvent({ model: animal });
    };

    
    public readonly intf = {};
}
