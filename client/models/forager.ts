import { Model } from ".";
import type { App } from "../app";
import { IModel } from "../type/model";
import { ModelCode } from "../type/registry";

export type ForagerModelDefine = IModel.CommonDefine<{
    code: ModelCode.Forager,
    state: {
        energy: number,
        maxEnergy: number,
        energyWaste: number,
    },
    handlerDefDict: {
        tickDone: void
    }
}>

export class ForagerModel extends Model<ForagerModelDefine> {
    public $handlerCallerDict: IModel.EventHandlerCallerDict<ForagerModelDefine> = {
        tickDone: this.handleTimeUpdateDone
    };

    constructor(
        config: IModel.Config<ForagerModelDefine>,
        app: App
    ) {
        super(
            {
                ...config,
                originState: {
                    maxEnergy: 100,
                    energy: config.originState?.maxEnergy || 100,
                    energyWaste: 1,
                    ...config.originState
                },
                childBundleList: [],
                childBundleDict: {}
            }, 
            app
        );
    }

    public bootDriver(): void {
        const timer = this.root.childDict.time;
        timer.eventEmitterDict.tickDone.bindHandler(
            this.$handlerDict.tickDone
        );
    }

    protected handleTimeUpdateDone(): void {
        this.$originState.energy -= this.currentState.energyWaste;
    }
}