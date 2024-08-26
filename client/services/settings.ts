import type { App } from "../app";
import { AppInfo } from "../type/app";
import { singleton } from "../utils/singleton";

@singleton
export class SettingsService {
    public readonly app: App;
    private $data!: AppInfo.Settings;
    public get data() { return { ...this.$data }; } 

    constructor(app: App) {
        this.app = app;
    }

    public initialize(data: AppInfo.Settings) {
        this.$data = data;
    }

    public async updateSettings(data: AppInfo.Settings) {
        this.$data = data;
        await this.app.saveMetaData();
        return;
    }
}
