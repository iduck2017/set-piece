import type { App } from "../app";
import { IBase } from "../type";
import { Entity } from "../utils/entity";

export abstract class Renderer<
    E extends IBase.Dict,
> extends Entity {
    protected abstract readonly _rendererCallerDict: {
        [K in keyof E]: (event: E[K]) => void;
    }

    constructor(app: App) {
        super(app);
    }
}