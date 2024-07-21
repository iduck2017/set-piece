import { META_PATH } from "../configs/base";
import { META_DATA } from "../configs/app";
import { AppStatus } from "../types/status";
import { Lifecycle } from "../utils/lifecyle";
import { singleton } from "../utils/singleton";
import { Service } from "./base";
import { MetaData } from "../types/app";

@singleton
export class MetaService extends Service {
    @Lifecycle.app(AppStatus.INITED)
    public async head(): Promise<MetaData> {
        const raw = await localStorage.getItem(META_PATH);
        if (!raw) return META_DATA;
        const result = JSON.parse(raw) as MetaData;
        return result;
    }

    @Lifecycle.app(
        AppStatus.UNMOUNTED, 
        AppStatus.MOUNTED
    )
    public async save() {
        const save: MetaData = {
            version   : this.app.v,
            perference: this.app.conf.data,
            slots     : this.app.slot.data
        };
        await localStorage.setItem(META_PATH, JSON.stringify(save));
    } 
}