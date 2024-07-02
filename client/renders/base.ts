import type { App } from "../app";
import { BaseFunction } from "../types/base";
import { BaseModel } from "../types/model";

export abstract class Renderer<
    E extends Record<number, BaseFunction>
> {
    private _app: App;

    public readonly _emitters: { [K in keyof E]?: BaseModel[] } = {};
    public abstract readonly _handle: E

    constructor(app: App) {
        this._app = app;
    }

    public deactive() {
        for (const key in this._emitters) {
            const emitters = this._emitters[key];
            for (const emitter of emitters || []) {
                emitter.unbind(key, this);
            }
        }
    }
}