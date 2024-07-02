import type { App } from "../app";
import { Model } from "../models/base";
import { BaseData, BaseFunction } from "../types/base";
import { EventId } from "../types/events";
import { BaseModel } from "../types/model";
import { ModelId } from "../types/registry";
import { Renderer } from "./base";

export class DebugRenderer extends Renderer<EventId.UPDATE_DONE> {
    private _setData: React.Dispatch<React.SetStateAction<any>>;

    public _handle = {
        [EventId.UPDATE_DONE]: this._handleUpdateDone
    }; 

    constructor(config: {
        setData: BaseFunction
    }, app: App) {
        super(app);
        this._setData = config.setData;
    }

    public active(target: BaseModel) {
        target.bind(EventId.UPDATE_DONE, this);
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