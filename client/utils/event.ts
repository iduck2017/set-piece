import { KeyOf } from "../type";
import { ModelDef } from "../type/model/define";
import { EventType } from "../type/event";
import type { Effect } from "./effect";
import type { App } from "../app";


export namespace SafeEvent {
    export type ModelDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.EventDict<D>>]: SafeEvent<ModelDef.EventDict<D>[K]>;
    }

    export type StateCheckDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.Info<D>>]: SafeEvent<
            EventType.StateCheckBefore<D, ModelDef.Info<D>[K]>
        >
    }
    export type StateAlterDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.Info<D>>]: SafeEvent<
            EventType.StateAlterDone<D, ModelDef.Info<D>[K]>
        >
    }
}

export type SafeEvent<E = any> = {
    id: string;
    bindEffect: (effect: Effect<E>) => void;
    unbindEffect: (effect: Effect<E>) => void;
}

export namespace Event {
    export type ModelDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.EventDict<D>>]: Event<ModelDef.EventDict<D>[K]>;
    }

    export type StateCheckDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.Info<D>>]: Event<
            EventType.StateCheckBefore<D, ModelDef.Info<D>[K]>
        >
    }
    export type StateAlterDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.Info<D>>]: Event<
            EventType.StateAlterDone<D, ModelDef.Info<D>[K]>
        >
    }
}

export class Event<E = any> {
    public readonly id: string;

    private readonly _effectList: Effect<E>[];
    public get effectIdList() {
        const effectIdList = [];
        for (const effect of this._effectList) {
            effectIdList.push(effect.id);
        }
        return effectIdList;
    }

    public readonly safeEvent: SafeEvent<E>;

    constructor(
        app: App,
        handleUpdate?: (event: Event<E>) => void
    ) {
        this.id = app.referenceService.ticket;
        this._effectList = [];

        this.safeEvent = {
            id: this.id,
            bindEffect: this.bindEffect.bind(this),
            unbindEffect: this.unbindEffect.bind(this)
        };
        this._handleUpdate = handleUpdate;
    }

    private readonly _handleUpdate?: (event: Event<E>) => void; 

    public readonly bindEffect = (effect: Effect<E>) => {
        const index = this._effectList.indexOf(effect);
        if (index >= 0) return;
        this._effectList.push(effect);
        effect.bindEvent(this);
        this._handleUpdate?.(this);
    };

    public readonly unbindEffect = (effect: Effect<E>) => {
        const index = this._effectList.indexOf(effect);
        if (index < 0) return;
        this._effectList.splice(index, 1);
        effect.unbindEvent(this);
        this._handleUpdate?.(this);
    };

    public readonly emitEvent = (event: E): E | void => {
        let prevEvent = event;
        for (const effect of this._effectList) {
            const result = effect.handleEvent(prevEvent);
            if (result) prevEvent = result;
        }
        return prevEvent;
    };

    public readonly destroy = () => {
        for (const effect of this._effectList) {
            this.unbindEffect(effect);
        }
    };
}

