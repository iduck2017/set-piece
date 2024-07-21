import { AppStatus } from "../types/status";
import { Lifecycle } from "../utils/lifecyle";
import { singleton } from "../utils/singleton";
import { Service } from "./base";
import { ConfData } from "../types/app";

@singleton
export class ConfigService extends Service {
    private $data!: ConfData;
    public get data() { return this.$data; } 

    @Lifecycle.app(AppStatus.INITED)
    public init(config: ConfData) {
        this.$data = config;
    }

    @Lifecycle.app(AppStatus.UNMOUNTED)
    public async update(data: ConfData) {
        this.$data = data;
        await this.app.meta.save();
        return;
    }
}
