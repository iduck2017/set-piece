import { TmplModelConfig } from "../type/model/config";
import { TmplModelDef } from "../type/model/define";
import { Random } from "../utils/random";
import { AnimalFeaturesModelDef } from "./animal-feature";
import { Model } from ".";
import { useProduct } from "../utils/decor/product";

export type BunnyModelDef = TmplModelDef<{
    code: 'bunny',
    info: {
        curAge: number,
        maxAge: number,
        curHappiness: number,
    },
    reactDict: {
        timeUpdateDone: void,
    },
    childDict: {
        features: AnimalFeaturesModelDef
    }
}>

@useProduct('bunny')
export class BunnyModel extends Model<BunnyModelDef> {
   
    constructor(config: TmplModelConfig<BunnyModelDef>) {
        super({
            ...config,
            childDict: {
                features: config.childDict?.features || { code: 'animal_features' }
            },
            info: {
                curAge: config.info?.curAge || 0,
                maxAge: config.info?.maxAge ||  Random.number(-25, 25) + 100,
                curHappiness: config.info?.curHappiness || 100
            }
        });
    }

    protected readonly _recover = () => {
        const timer = this.app.root.childDict.timer;
        timer.eventDict.tickBefore.bindReact(
            this._reactDict.timeUpdateDone
        );
    };

    /** 繁殖幼崽 */
    public readonly reproduce = () => {
        this.app.root.spawnCreature({
            code: 'bunny'
        });
    };

    /** 自杀 */
    public readonly suicide = () => {
        this.app.root.killCreature(this);
    };

    /** 年龄增长 */
    private readonly _handleTimeUpdateDone = () => {
        console.log('growing', this.id);
        this._originInfo.curAge += 1;
    };

    protected readonly _reactDict = this._initReactDict({
        timeUpdateDone: this._handleTimeUpdateDone
    });

    public readonly intf = {};
}