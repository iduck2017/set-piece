import { KeyOf } from "../type";
import { ModelDef } from "../type/model/define";
import type { Effect } from "./effect";
import type { App } from "../app";
import { Event } from "../type/event";

export namespace SafeSignal {
    export type ModelDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.SignalDict<D>>]: SafeSignal<ModelDef.SignalDict<D>[K]>;
    }

    export type StateEditorDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.State<D>>]: SafeSignal<
            Event.StateEdit<D, ModelDef.State<D>[K]>
        >
    }
    export type StatePosterDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.State<D>>]: SafeSignal<
            Event.StatePost<D, ModelDef.State<D>[K]>
        >
    }
}

export type SafeSignal<E = any> = {
    id: string;
    bindEffect: (effect: Effect<E>) => void;
    unbindEffect: (effect: Effect<E>) => void;
}

export namespace Signal {
    export type ModelDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.SignalDict<D>>]: Signal<ModelDef.SignalDict<D>[K]>;
    }

    export type StateEditorDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.State<D>>]: Signal<
            Event.StateEdit<D, ModelDef.State<D>[K]>
        >
    }
    export type StatePosterDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.State<D>>]: Signal<
            Event.StatePost<D, ModelDef.State<D>[K]>
        >
    }
}

export class Signal<E = any> {
    public readonly id: string;

    private readonly _effectList: Effect<E>[];
    public get effectIdList() {
        const effectIdList = [];
        for (const effect of this._effectList) {
            effectIdList.push(effect.id);
        }
        return effectIdList;
    }

    public readonly safeSignal: SafeSignal<E>;

    constructor(
        app: App,
        handleUpdate?: (signal: Signal<E>) => void
    ) {
        this.id = app.referenceService.ticket;
        this._effectList = [];

        this.safeSignal = {
            id: this.id,
            bindEffect: this.bindEffect.bind(this),
            unbindEffect: this.unbindEffect.bind(this)
        };
        this._handleUpdate = handleUpdate;
    }

    private readonly _handleUpdate?: (signal: Signal<E>) => void; 

    public bindEffect(effect: Effect<E>) {
        const index = this._effectList.indexOf(effect);
        if (index >= 0) return;
        this._effectList.push(effect);
        effect.bindSignal(this);
        this._handleUpdate?.(this);
    }

    public unbindEffect(effect: Effect<E>) {
        const index = this._effectList.indexOf(effect);
        if (index < 0) return;
        this._effectList.splice(index, 1);
        effect.unbindSignal(this);
        this._handleUpdate?.(this);
    }

    public emitEvent(signal: E): E | void {
        let prevSignal = signal;
        for (const effect of this._effectList) {
            const result = effect.handleEvent(prevSignal);
            if (result) prevSignal = result;
        }
        return prevSignal;
    }

    public destroy()  {
        for (const effect of this._effectList) {
            this.unbindEffect(effect);
        }
    }
}

