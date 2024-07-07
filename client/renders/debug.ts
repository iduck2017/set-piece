import type { App } from "../app";
import { Consumer } from "../utils/consumer";
import { BaseRecord, BaseFunction } from "../types/base";
import { EventId, UpdateDoneEvent } from "../types/events";
import { BaseModel } from "../types/model";
import { Renderer } from "./base";
import { ModelData } from "../utils/model-data";

export class DebugRenderer extends Renderer<{
    [EventId.UPDATE_DONE]: UpdateDoneEvent
}> {
    private _setData: React.Dispatch<React.SetStateAction<any>>;

    public consumer = new Consumer({
        handlers: {
            [EventId.UPDATE_DONE]: this._handleUpdateDone.bind(this)
        }
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
        I extends BaseRecord,
        S extends BaseRecord,
        K extends keyof (I & S)
    >(data: {
            target: ModelData<BaseRecord, I, S>,
            key: K,
            prev: (I & S)[K],
            next: (I & S)[K]
        }
    ) {
        this._setData((prev: any) => ({
            ...prev,
            [data.key]: data.next 
        }));
    }
}