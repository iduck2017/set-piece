import { Model } from "../models";
import { IBase } from "../type";

export class EventEmitter<
    E extends IBase.Dict
> {
    public readonly model?: Model;
    public readonly key?: string;

    public eventHandlerList: EventHandler<E>[] = [];

    constructor(
        model?: Model, 
        key?: string
    ) {
        this.model = model;
        this.key = key;
    }

    private $addEventHandler(eventHandler: EventHandler<E>) {
        this.eventHandlerList.push(eventHandler);
    }

    private $removeEventHandler(eventHandler: EventHandler<E>) {
        const index = this.eventHandlerList.indexOf(eventHandler);
        if (index >= 0) {
            this.eventHandlerList.splice(index, 1);
        }
    }

    public bindHandler(handleEvent: (event: E) => void) {
        const eventHandler = new EventHandler(handleEvent, this.model, this.key);
        this.$addEventHandler(eventHandler);
        return eventHandler;
    }

    public unbindHandler(eventHandler: EventHandler<E>) {
        this.$removeEventHandler(eventHandler);
    }

    public emitEvent(event: E) {
        for (const eventHandler of this.eventHandlerList) {
            eventHandler.handleEvent(event);
        }
    }

    public serializeChunk() {
        return this.eventHandlerList.map(item => {
            if (item.model && item.key) {
                return {
                    model: item.model.id,
                    key: item.key
                };
            }
        });
    }
}

export class EventHandler<
    E extends IBase.Dict
> {
    public readonly model?: Model;
    public readonly key?: string;

    public readonly eventEmitterList: EventEmitter<E>[] = [];
    public readonly handleEvent: (event: E) => void;

    constructor(
        handleEvent: (event: E) => void,
        model?: Model,
        key?: string
    ) {
        this.model = model;
        this.key = key;
        this.handleEvent = handleEvent;
    }

    public $addEventEmitter(eventEmitter: EventEmitter<E>) {
        this.eventEmitterList.push(eventEmitter);
    }

    public $removeEventEmitter(eventEmitter: EventEmitter<E>) {
        const index = this.eventEmitterList.indexOf(eventEmitter);
        if (index >= 0) {
            this.eventEmitterList.splice(index, 1);
        }
    }

    public serializeChunk() {
        return this.eventEmitterList.map(item => {
            if (item.model && item.key) {
                return {
                    model: item.model.id,
                    key: item.key
                };
            }
        });
    }
}