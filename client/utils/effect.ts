import type { App } from "../app";
import { KeyOf } from "../type";
import { ModelDef } from "../type/model/define";
import { SafeEvent } from "./event";

export namespace Effect {
    export type ModelDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.EffectDict<D>>]: 
            Effect<ModelDef.EffectDict<D>[K]>
    }
}

export class Effect<E = any> {
    public readonly id: string;

    private readonly _eventList: SafeEvent<E>[] = [];
    public get eventIdList() {
        return this._eventList.map(event => event.id);
    }

    constructor(
        app: App,
        handleEvent: (event: E) => E | void,
        bindDone?: () => void
    ) {
        this.id = app.referenceService.ticket;
        this.handleEvent = handleEvent;
        this._bindDone = bindDone;
    }

    private readonly _bindDone?: (react: Effect<E>) => void;
    public readonly handleEvent: (event: E) => E | void;
    
    public readonly bindEvent = (event: SafeEvent<E>) => {
        const index = this._eventList.indexOf(event);
        if (index >= 0) return;
        this._eventList.push(event);
        event.bindEffect(this);
        this._bindDone?.(this);
    };

    public readonly unbindEvent = (event: SafeEvent<E>) => {
        const index = this._eventList.indexOf(event);
        if (index < 0) return;
        this._eventList.splice(index, 1);
        event.unbindEffect(this);
        this._bindDone?.(this);
    };

    public readonly destroy = () => {
        for (const event of this._eventList) {
            this.unbindEvent(event);
        }
    };
}
