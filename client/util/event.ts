import { IModel } from "../model";

export namespace Event {
    export type Handler<E> = (event: E) => E | void;
    export type Proxy<E> = {
        bind: Event<E>["bind"];
        unbind: Event<E>["unbind"];
    }
}

export class Event<E> {
    private readonly _listener: () => void;
    private readonly _handlerSet: Array<Readonly<[ 
        IModel, 
        Event.Handler<E> 
    ]>> = [];
    get handlerSet() {
        return [ ... this._handlerSet ];
    }

    readonly parent: IModel;
    readonly proxy: Event.Proxy<E> = {
        bind: this.bind.bind(this),
        unbind: this.unbind.bind(this)
    };
    
    constructor(
        parent: IModel,
        handleUpdate: () => void
    ) {
        this._listener = handleUpdate;
        this.parent = parent;
    }

    bind(refer: IModel, handler: Event.Handler<E>) {
        this._handlerSet.push([ refer, handler ]);
        refer.connect(this.parent);
        this.parent.connect(refer);
        this._listener();
    }

    unbind(refer: IModel, handler: Event.Handler<E>) {
        this.uninit(refer, handler);
    }

    emit(form: E): E {
        let _event = form;
        const handlerSet = [ ...this._handlerSet ];
        for (const [ refer, handler ] of handlerSet) {
            const result = handler.call(refer, _event);
            if (result) _event = result;
        }
        return _event;
    }

    uninit(refer?: IModel, handler?: Event.Handler<E>) {
        while (true) {
            const index = this._handlerSet.findIndex(item => {
                const [ _refer, _handler ] = item;
                if (handler && _handler !== handler) return false;
                if (refer && _refer !== refer) return false;
                return true;
            });
            if (index < 0) break;
            this._handlerSet.splice(index, 1);
        }
        this._listener();
    }
}