import type { App } from "../app";
import { singleton } from "../utils/singleton";

export type PerferenceData = {
    fullscreen: boolean
    mute: boolean
}

@singleton
export class PreferenceService {
    public readonly app: App;

    private $settingsData!: PerferenceData;
    public get settingsData() { return { ...this.$settingsData }; } 

    constructor(app: App) {
        this.app = app;
    }

    public initialize(data: PerferenceData) {
        this.$settingsData = data;
    }

    public async updateSettings(data: PerferenceData) {
        this.$settingsData = data;
        await this.app.saveMetaData();
        return;
    }
}
