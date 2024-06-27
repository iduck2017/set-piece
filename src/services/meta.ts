import { META_PATH } from "../configs/base";
import { META_DATA } from "../configs/meta";
import { AppStatus } from "../types/status";
import { MetaData } from "../types/app";
import { appStatus } from "../utils/decors/status";
import { singleton } from "../utils/decors/singleton";
import { Service } from "./base";

@singleton
export class MetaService extends Service {
    @appStatus(AppStatus.INITED)
    public async head(): Promise<MetaData> {
        const raw = await localStorage.getItem(META_PATH);
        if (!raw) return META_DATA;
        const result = JSON.parse(raw) as MetaData;
        return result;
    }

    @appStatus(AppStatus.UNMOUNTED, AppStatus.MOUNTED)
    public async save() {
        const save: MetaData = {
            version: this.app.version,
            perference: this.app.services.perference.data,
            slots: this.app.services.slots.data
        };
        await localStorage.setItem(META_PATH, JSON.stringify(save));
    } 
}