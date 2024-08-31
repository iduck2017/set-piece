import type { App } from "../app";
import { AppInfo } from "../type/app";
import { singleton } from "../utils/singleton";

@singleton
export class SettingsService {
    public readonly app: App;

    private $settingsData!: AppInfo.Settings;
    public get settingsData() { return { ...this.$settingsData }; } 

    constructor(app: App) {
        this.app = app;
    }

    public initialize(data: AppInfo.Settings) {
        this.$settingsData = data;
    }

    public async updateSettings(data: AppInfo.Settings) {
        this.$settingsData = data;
        await this.app.saveMetaData();
        return;
    }
}
