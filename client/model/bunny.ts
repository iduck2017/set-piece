import { TmplModelConfig } from "../type/model/config";
import { TmplModelDef } from "../type/model/define";
import { Random } from "../utils/random";
import { AnimalFeaturesModelDef } from "./animal-feature";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";

export type BunnyModelDef = TmplModelDef<{
    code: 'bunny',
    state: {
        curAge: number,
        maxAge: number,
        curHappiness: number,
    },
    effectDict: {
        timeUpdateDone: void,
    },
    childDict: {
        features: AnimalFeaturesModelDef
    },
}>

@useProduct('bunny')
export class BunnyModel extends Model<BunnyModelDef> {
    public readonly methodDict = {
        reproduce: this._reproduce.bind(this),
        suicide: this._suicide.bind(this)
    };
    protected readonly _effectDict = this.EffectDict({
        timeUpdateDone: this._handleTimeUpdateDone
    });

    constructor(config: TmplModelConfig<BunnyModelDef>) {
        super({
            ...config,
            childDict: {
                features: config.childDict?.features || { code: 'animal_features' }
            },
            state: {
                curAge: config.state?.curAge || 0,
                maxAge: config.state?.maxAge ||  Random.number(-25, 25) + 100,
                curHappiness: config.state?.curHappiness || 100
            }
        });
        this.testMethodDict = {
            reproduce: this._reproduce.bind(this)
        };
    }

    protected _active() {
        const timer = this.app.root.childDict.timer;
        timer.signalDict.tickBefore.bindEffect(
            this._effectDict.timeUpdateDone
        );
    }

    /** 繁殖幼崽 */
    private _reproduce() {
        this.app.root.methodDict.spawnCreature({
            code: 'bunny'
        });
    }

    /** 自杀 */
    public _suicide() {
        this.app.root.methodDict.killCreature(this);
    }

    /** 年龄增长 */
    private _handleTimeUpdateDone() {
        this._originState.curAge += 1;
    }
}