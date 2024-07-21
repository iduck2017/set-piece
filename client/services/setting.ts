import { AppStatus } from "../types/status";
import { appStatus } from "../utils/status";
import { singleton } from "../utils/singleton";
import { Service } from "./base";
import { ConfData } from "../types/app";

@singleton
export class ConfigService extends Service {
    private $data!: ConfData;
    public get data() { return this.$data; } 

    @appStatus(AppStatus.INITED)
    public init(config: ConfData) {
        this.$data = config;
    }

    @appStatus(AppStatus.UNMOUNTED)
    public async update(data: ConfData) {
        this.$data = data;
        await this.app.meta.save();
        return;
    }
}
