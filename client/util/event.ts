import { Model } from "@/model";

export namespace Event {
    export type Proxy<E> = Event<E>['proxy']
    export type Handler<E> = (event: E) => E | void
}

export class Event<E> {
    private readonly _onBind;
    private readonly _handlers: Array<Readonly<[ 
        Model, 
        Event.Handler<E> 
    ]>> = [];
    get handlers() {
        return [ ... this._handlers ];
    }

    readonly key: string | undefined;
    readonly parent: Model;
    readonly proxy = {
        on: this.on.bind(this),
        off: this.off.bind(this)
    };
    
    constructor(parent: Model<any>, key?: string, onBind?: () => void) {
        this.parent = parent;
        this.key = key;
        this._onBind = onBind;
    }

    on(refer: Model, handler: Event.Handler<E>) {
        this._handlers.push([ refer, handler ]);
        refer.connect(this.parent);
        this.parent.connect(refer);
        this._onBind?.();
        return this.off.bind(this, refer, handler);
    }

    off(refer: Model, handler: Event.Handler<E>) {
        this.unload(refer, handler);
    }

    emit(form: E): E {
        let _event = form;
        const handlerSet = [ ...this._handlers ];
        for (const [ refer, handler ] of handlerSet) {
            const result = handler.call(refer, _event);
            if (result) _event = result;
        }
        return _event;
    }

    unload(refer?: Model, handler?: Event.Handler<E>) {
        while (true) {
            const index = this._handlers.findIndex(item => {
                const [ _refer, _handler ] = item;
                if (handler && _handler !== handler) return false;
                if (refer && _refer !== refer) return false;
                return true;
            });
            if (index < 0) break;
            this._handlers.splice(index, 1);
        }
        if (this._onBind) {
            console.log('unbind event');
        }
        this._onBind?.();
    }
}