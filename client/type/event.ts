import { KeyOf } from ".";
import { ModelDef } from "./model-def";
import type { Model } from "../models";

export type StateUpdateBefore<
    M extends ModelDef, T
> = {
    target: Model<M>,
    prev: T,
    next: T,
    canncel?: boolean
}
    
export type StateUpdateDone<
    M extends ModelDef, T
> = {
    target: Model<M>,
    next: T,
    prev: T,
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

export class React<E = any> {
    private readonly _eventList: SafeEvent<E>[] = [];

    constructor(
        handleEvent: (event: E) => void,
        bindDone?: () => void
    ) {
        this.handleEvent = handleEvent;
        this._bindDone = bindDone;
    }

    private readonly _bindDone?: (react: React<E>) => void;
    public readonly handleEvent: (event: E) => void;
    
    public readonly bindEvent = (event: SafeEvent<E>) => {
        const index = this._eventList.indexOf(event);
        if (index >= 0) return;
        this._eventList.push(event);
        event.bindReact(this);
        this._bindDone?.(this);
    };

    public readonly unbindEvent = (event: SafeEvent<E>) => {
        const index = this._eventList.indexOf(event);
        if (index < 0) throw new Error('Event not found');
        this._eventList.splice(index, 1);
        event.unbindReact(this);
        this._bindDone?.(this);
    };

    public readonly destroy = () => {
        for (const event of this._eventList) {
            this.unbindEvent(event);
        }
    };
}

// 事件触发器
// export type EventIntf<E = any> = 
//     SafeEvent<E> &
//     Readonly<{
//         model: Model;
//         reactList: ReactIntf<E>[];
//         safeEvent: SafeEvent<E>;
//         emitEvent: (event: E) => void;
//         destroy: () => void;
//     }>

// export type SafeEvent<E = any> = Readonly<{
//     modelId: string;
//     eventKey: string;
//     stateKey?: string;
//     [EVENT_SYMBOL]?: E;
// }>

export type SafeEvent<E = any> = {
    bindReact: (react: React<E>) => void;
    unbindReact: (react: React<E>) => void;
}

export type ReactDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.ReactDict<M>>]: 
        React<ModelDef.ReactDict<M>[K]>
}

export type EventDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.EventDict<M>>]:
        Event<ModelDef.EventDict<M>[K]>;
}
export type ModifyEventDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.Info<M>>]: Event<
        StateUpdateBefore<M, ModelDef.Info<M>[K]>
    >
}
export type UpdateEventDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.Info<M>>]: Event<
        StateUpdateDone<M, ModelDef.Info<M>[K]>
    >
}

export type SafeEventDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.EventDict<M>>]:
        SafeEvent<ModelDef.EventDict<M>[K]>;
}
export type ModifySafeEventDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.Info<M>>]: SafeEvent<
        StateUpdateBefore<M, ModelDef.Info<M>[K]>
    >
}
export type UpdateSafeEventDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.Info<M>>]: SafeEvent<
        StateUpdateDone<M, ModelDef.Info<M>[K]>
    >
}
