import { AppStatus } from "../types/status";
import { PerferenceData } from "../types/app";
import { appStatus } from "../utils/decors/status";
import { singleton } from "../utils/decors/singleton";
import { Service } from "./base";

@singleton
export class PerferenceService extends Service {
    private _data!: PerferenceData;
    public get data() { return { ...this._data }; } 

    @appStatus(AppStatus.INITED)
    public init(config: PerferenceData) {
        this._data = config;
    }

    @appStatus(AppStatus.UNMOUNTED)
    public async update(data: PerferenceData) {
        this._data = data;
        await this.app.services.meta.save();
        return;
    }
}
