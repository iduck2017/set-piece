import { Model } from "../models";

export class Emitter<E = any> {
    public readonly model: Model;
    public readonly key: string;

    private readonly $handlerList: Handler<E>[] = [];

    constructor(
        model: Model, 
        key: string
    ) {
        this.model = model;
        this.key = key;
    }

    private $addHandler(eventHandler: Handler<E>) {
        this.$handlerList.push(eventHandler);
    }

    private $removeHandler(eventHandler: Handler<E>) {
        const index = this.$handlerList.indexOf(eventHandler);
        if (index >= 0) {
            this.$handlerList.splice(index, 1);
        }
    }

    public bindHandler(handler: Handler<E>) {
        handler.$addEmitter(this);
        this.$addHandler(handler);
    }

    public unbindHandler(handler: Handler<E>) {
        this.$removeHandler(handler);
        handler.$removeEmitter(this);
    }

    public emitEvent(event: E) {
        for (const eventHandler of this.$handlerList) {
            eventHandler.handleEvent(event);
        }
    }

    public makeBundle(): string[] {
        const bundle: string[] = [];
        for (const eventEmitter of this.$handlerList) {
            if (eventEmitter.model && eventEmitter.key) {
                bundle.push(`${eventEmitter.model.id}_${eventEmitter.key}`);
            }
        }
        return bundle;
    }

    public unmountRoot() {
        this.$handlerList.forEach(item => {
            this.unbindHandler(item);
        });
    }
}

export class Handler<E = any> {
    public readonly model: Model;
    public readonly key: string;

    public readonly $emitterList: Emitter<E>[] = [];
    public readonly handleEvent: (event: E) => void;

    constructor(
        handleEvent: (event: E) => void,
        model: Model,
        key: string
    ) {
        this.model = model;
        this.key = key;
        this.handleEvent = handleEvent.bind(model);
    }

    public $addEmitter(eventEmitter: Emitter<E>) {
        this.$emitterList.push(eventEmitter);
    }

    public $removeEmitter(eventEmitter: Emitter<E>) {
        const index = this.$emitterList.indexOf(eventEmitter);
        if (index >= 0) {
            this.$emitterList.splice(index, 1);
        }
    }

    public makeBundle(): string[] {
        const bundle: string[] = [];
        for (const eventEmitter of this.$emitterList) {
            if (eventEmitter.model && eventEmitter.key) {
                bundle.push(`${eventEmitter.model.id}_${eventEmitter.key}`);
            }
        }
        return bundle;
    }

    public unmountRoot() {
        this.$emitterList.forEach(item => {
            item.unbindHandler(this);
        });
    }
}