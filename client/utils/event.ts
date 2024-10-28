import { Model } from "../model";

export namespace Event {
    export type Handler<E> = (event: E) => E | void;
    export type Proxy<E> = {
        bind: Event<E>["bind"];
        unbind: Event<E>["unbind"];
    }
}

export class Event<E> {
    readonly #listener: () => void;
    readonly #handlerSet: Array<Readonly<[ 
        Model, 
        Event.Handler<E> 
    ]>>;
    get handlerSet() {
        return [ ... this.#handlerSet ];
    }

    readonly parent: Model;
    readonly proxy: Event.Proxy<E>;
    
    constructor(
        parent: Model,
        handleUpdate: () => void
    ) {
        this.#handlerSet = [];
        this.#listener = handleUpdate;

        this.parent = parent;
        this.proxy = {
            bind: this.bind.bind(this),
            unbind: this.unbind.bind(this)
        };
    }

    bind(refer: Model, handler: Event.Handler<E>) {
        this.#handlerSet.push([ refer, handler ]);
        refer.connect(this.parent);
        this.parent.connect(refer);
        this.#listener();
        // console.log('bind', this, this.parent, this.#handlerSet);
    }

    unbind(refer: Model, handler: Event.Handler<E>) {
        this.uninit(refer, handler);
    }

    emit(form: E): E {
        // console.log('emit', form, this.parent, this, this.#handlerSet);
        let $event = form;
        const handlerSet = [ ...this.#handlerSet ];
        for (const [ refer, handler ] of handlerSet) {
            const result = handler.call(refer, $event);
            if (result) $event = result;
        }
        return $event;
    }

    uninit(refer?: Model, handler?: Event.Handler<E>) {
        while (true) {
            const index = this.#handlerSet.findIndex(item => {
                const [ $refer, $handler ] = item;
                if (handler && $handler !== handler) return false;
                if (refer && $refer !== refer) return false;
                return true;
            });
            if (index < 0) break;
            this.#handlerSet.splice(index, 1);
        }
        this.#listener();
    }
}