import type { App } from "../app";
import { KeyOf } from "../type";
import { Event } from "../type/event";
import { ModelDef } from "../type/model/define";
import { SafeSignal } from "./signal";

export namespace Effect {
    export type ModelDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.EffectDict<D>>]: 
            Effect<ModelDef.EffectDict<D>[K]>
    }
}

export class Effect<E = any> {
    public readonly id: string;

    private readonly _signalList: SafeSignal<E>[] = [];
    public get signalIdList() {
        return this._signalList.map(signal => signal.id);
    }

    constructor(
        app: App,
        handleSignal: Event<E>,
        bindDone?: () => void
    ) {
        this.id = app.referenceService.ticket;
        this.handleSignal = handleSignal;
        this._bindDone = bindDone;
    }

    private readonly _bindDone?: (react: Effect<E>) => void;
    public readonly handleSignal: Event<E>;
    
    public readonly bindSignal = (signal: SafeSignal<E>) => {
        const index = this._signalList.indexOf(signal);
        if (index >= 0) return;
        this._signalList.push(signal);
        signal.bindEffect(this);
        this._bindDone?.(this);
    };

    public readonly unbindSignal = (signal: SafeSignal<E>) => {
        const index = this._signalList.indexOf(signal);
        if (index < 0) return;
        this._signalList.splice(index, 1);
        signal.unbindEffect(this);
        this._bindDone?.(this);
    };

    public destroy () {
        for (const signal of this._signalList) {
            this.unbindSignal(signal);
        }
    }
}
