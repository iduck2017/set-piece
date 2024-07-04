import type { App } from "../app";
import { Model } from "../models/base";
import { Consumer } from "../models/node";
import { BaseData, BaseFunction } from "../types/base";
import { EventId, UpdateDoneEvent } from "../types/events";
import { BaseModel } from "../types/model";
import { Renderer } from "./base";

export class DebugRenderer extends Renderer<{
    [EventId.UPDATE_DONE]: UpdateDoneEvent
}> {
    private _setData: React.Dispatch<React.SetStateAction<any>>;

    public consumer = new Consumer({
        [EventId.UPDATE_DONE]: this._handleUpdateDone.bind(this)
    }, this); 

    constructor(config: {
        setData: BaseFunction
    }, app: App) {
        super(app);
        this._setData = config.setData;
    }

    public active(target: BaseModel) {
        target.provider.bind(EventId.UPDATE_DONE, this.consumer);
    }

    public deactive() {
        this.consumer.dispose();
    }

    protected _handleUpdateDone<
        R extends BaseData,
        I extends BaseData,
        S extends BaseData,
        K extends keyof (R & I & S)
    >(data: {
            target: Model<
                number,
                never,
                never,
                R,
                I,
                S,
                BaseModel | App
            >,
            key: K,
            prev: (R & I & S)[K],
            next: (R & I & S)[K]
        }
    ) {
        this._setData((prev: any) => ({
            ...prev,
            [data.key]: data.next 
        }));
    }
}