import type { App } from "../app";
import { Consumer, Data } from "../models/node";
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
    }); 

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
        this.consumer._dispose();
    }

    protected _handleUpdateDone<
        I extends BaseData,
        S extends BaseData,
        K extends keyof (I & S)
    >(data: {
            target: Data<BaseData, I, S>,
            key: K,
            prev: (I & S)[K],
            next: (I & S)[K]
        }
    ) {
        console.log('update');
        this._setData((prev: any) => ({
            ...prev,
            [data.key]: data.next 
        }));
    }
}