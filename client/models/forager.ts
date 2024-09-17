import { Model } from ".";
import type { App } from "../app";
import { IModel } from "../type/model";
import { ModelCode } from "../type/registry";
import { TimerModelDefine } from "./time";

export type ForagerModelDefine = IModel.CommonDefine<{
    code: ModelCode.Forager,
    state: {
        energy: number,
        maxEnergy: number,
        energyWaste: number,
    },
    listenedDefDict: {
        tickDone: TimerModelDefine
    }
}>

export class ForagerModel extends Model<ForagerModelDefine> {
    protected $eventHandlerDict: IModel.EventHandlerDict<ForagerModelDefine> = {
        listener: {
            tickDone: this.handleTimeUpdateDone
        },
        observer: {},
        modifier: {}
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

    public activate(): void {
        const timer = this.root.childDict.time;
        timer.eventChannelDict.listened.tickDone.bind(this);
    }

    protected handleTimeUpdateDone(): void {
        this.$originState.energy -= this.currentState.energyWaste;
    }
}