import type { App } from "../app";
import { useSingleton } from "../utils/decor/singleton";

export type PerferenceData = {
    fullscreen: boolean
    mute: boolean
}

@useSingleton
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
