import { KeyOf } from "../type";
import { ModelDef } from "../type/model/define";
import { Event } from "../type/event";
import type { Effect } from "./effect";
import type { App } from "../app";

export namespace SafeSignal {
    export type ModelDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.SignalDict<D>>]: SafeSignal<ModelDef.SignalDict<D>[K]>;
    }

    export type StateCheckDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.Info<D>>]: SafeSignal<
            Event.StateCheck<D, ModelDef.Info<D>[K]>
        >
    }
    export type StateAlterDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.Info<D>>]: SafeSignal<
            Event.StateAlter<D, ModelDef.Info<D>[K]>
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

    export type StateCheckDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.Info<D>>]: Signal<
            Event.StateCheck<D, ModelDef.Info<D>[K]>
        >
    }
    export type StateAlterDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.Info<D>>]: Signal<
            Event.StateAlter<D, ModelDef.Info<D>[K]>
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

    public readonly bindEffect = (effect: Effect<E>) => {
        const index = this._effectList.indexOf(effect);
        if (index >= 0) return;
        this._effectList.push(effect);
        effect.bindSignal(this);
        this._handleUpdate?.(this);
    };

    public readonly unbindEffect = (effect: Effect<E>) => {
        const index = this._effectList.indexOf(effect);
        if (index < 0) return;
        this._effectList.splice(index, 1);
        effect.unbindSignal(this);
        this._handleUpdate?.(this);
    };

    public readonly emitSignal = (signal: E): E | void => {
        let prevSignal = signal;
        for (const effect of this._effectList) {
            const result = effect.handleSignal(prevSignal);
            if (result) prevSignal = result;
        }
        return prevSignal;
    };

    public readonly destroy = () => {
        for (const effect of this._effectList) {
            this.unbindEffect(effect);
        }
    };
}

