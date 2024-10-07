import { KeyOf } from "../type";
import { ModelDef } from "../type/model-def";
import { SafeEvent } from "./event";

export type ReactDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.ReactDict<M>>]: 
        React<ModelDef.ReactDict<M>[K]>
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
