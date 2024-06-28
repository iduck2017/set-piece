import { AppStatus } from "../types/status";
import { SettingData } from "../types/app";
import { appStatus } from "../utils/status";
import { singleton } from "../utils/decors";
import { Service } from "./base";

@singleton
export class SettingService extends Service {
    private _data!: SettingData;
    public get data() { return { ...this._data }; } 

    @appStatus(AppStatus.INITED)
    public init(config: SettingData) {
        this._data = config;
    }

    @appStatus(AppStatus.UNMOUNTED)
    public async update(data: SettingData) {
        this._data = data;
        await this.app.services.meta.save();
        return;
    }
}
