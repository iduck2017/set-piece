import type { App } from "../app";
import { singleton } from "../utils/singleton";

export type PerferenceData = {
    fullscreen: boolean
    mute: boolean
}

@singleton
export class PreferenceService {
    public readonly app: App;

    private _data!: PerferenceData;
    public get data() { return { ...this._data }; } 

    constructor(app: App) {
        this.app = app;
    }

    public initialize(data: PerferenceData) {
        this._data = data;
    }

    public async updateSettings(data: PerferenceData) {
        this._data = data;
        await this.app.saveMetaData();
        return;
    }
}
