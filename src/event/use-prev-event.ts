import { Constructor, Method } from "../types";
import { Model } from "../model";
import { Event } from ".";

export abstract class PrevEvent<P> extends Event {
    constructor(props: {
        options: P;
    }) {
        super();
        this.options = props.options;
    }

    public readonly options: P;

    private _isAborted: boolean = false;
    public get isAborted() {
        return this._isAborted;
    }
    public abort() {
        this._isAborted = true;
    }
}


export function usePrevEvent<
    P extends any,
    R extends any,
    E extends PrevEvent<P>
>(selector: () => Constructor<E, [{ options: P }]>) {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<Method<R | undefined, [P, E | undefined]>>
    ) {
        const method = descriptor.value;
        if (!method) return descriptor;
        descriptor.value = function(this: Model, options: P, event: E | undefined) {
            const type = selector();
            event = new type({ options });
            this.emit(event);
            if (event.isAborted) return;
            return method.call(this, options, event);
        }
    }
}