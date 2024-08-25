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

    public init(config: AppInfo.Settings) {
        this.$data = config;
    }

    public async update(data: AppInfo.Settings) {
        this.$data = data;
        await this.app.saveGame();
        return;
    }
}
