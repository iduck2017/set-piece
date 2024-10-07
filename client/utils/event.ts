import { KeyOf } from "../type";
import { ModelDef } from "../type/model-def";
import { StateUpdateBefore, StateUpdateDone } from "../type/event";
import type { React } from "./react";

export type EventDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.EventDict<M>>]: Event<ModelDef.EventDict<M>[K]>;
}
export type ModifyEventDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.Info<M>>]: Event<StateUpdateBefore<M, ModelDef.Info<M>[K]>>
}
export type UpdateEventDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.Info<M>>]: Event<StateUpdateDone<M, ModelDef.Info<M>[K]>>
}

export class Event<E = any> {
    private readonly _reactList: React<E>[];
    public readonly safeEvent: SafeEvent<E>;

    constructor(
        bindDone?: (event: Event<E>) => void
    ) {
        this._reactList = [];
        this.safeEvent = {
            bindReact: this.bindReact.bind(this),
            unbindReact: this.unbindReact.bind(this)
        };
        this._bindDone = bindDone;
    }

    private readonly _bindDone?: (event: Event<E>) => void; 

    public readonly bindReact = (react: React<E>) => {
        console.log('bindReact', this._reactList);
        const index = this._reactList.indexOf(react);
        if (index >= 0) return;
        this._reactList.push(react);
        react.bindEvent(this);
        this._bindDone?.(this);
    };

    public readonly unbindReact = (react: React<E>) => {
        const index = this._reactList.indexOf(react);
        if (index < 0) return;
        this._reactList.splice(index, 1);
        react.unbindEvent(this);
        this._bindDone?.(this);
    };

    public readonly emitEvent = (event: E) => {
        console.log('emitEvent', this._reactList);
        this._reactList.forEach(react => {
            react.handleEvent(event);
        });
    };

    public readonly destroy = () => {
        for (const react of this._reactList) {
            this.unbindReact(react);
        }
    };
}


export type SafeEvent<E = any> = {
    bindReact: (react: React<E>) => void;
    unbindReact: (react: React<E>) => void;
}

export type SafeEventDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.EventDict<M>>]: SafeEvent<ModelDef.EventDict<M>[K]>;
}
export type ModifySafeEventDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.Info<M>>]: SafeEvent<StateUpdateBefore<M, ModelDef.Info<M>[K]>>
}
export type UpdateSafeEventDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.Info<M>>]: SafeEvent<StateUpdateDone<M, ModelDef.Info<M>[K]>>
}
