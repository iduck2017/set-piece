import type { App } from "../app";
import { Receivable } from "../utils/receivable";
import { BaseRecord, BaseFunc } from "../types/base";
import { DataUpdateDoneEvent } from "../types/events";
import { BaseModel } from "../types/model";
import { Renderer } from "./base";
import { Calculable } from "../utils/calculable";

export class DebugRenderer extends Renderer<{
    dataUpdateDone: DataUpdateDoneEvent
}> {
    private readonly $setData: React.Dispatch<React.SetStateAction<any>>;

    constructor(config: {
        app    : App
        setData: BaseFunc
    }) {
        super({
            app  : config.app,
            event: {
                dataUpdateDone: (...args) => this._handleUpdateDone(...args)  
            }
        });
        this.$setData = config.setData;
    }

    public active(target: BaseModel) {
        target.call.bind('dataUpdateDone', this.$recv);
    }

    public deactive() {
        this.$recv.dispose();
    }

    protected _handleUpdateDone<
        I extends BaseRecord,
        S extends BaseRecord,
        K extends keyof (I & S)
    >(data: {
            target: Calculable<BaseRecord, I, S>,
            key   : K,
            prev  : (I & S)[K],
            next  : (I & S)[K]
        }) {
        this.$setData((prev: any) => ({
            ...prev,
            [data.key]: data.next 
        }));
    }
}