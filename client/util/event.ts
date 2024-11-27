import { IModel, Model } from "@/model";

export class Event<E = any> {
    readonly target: Model;

    constructor(
        target: Model
    ) {
        this.target = target;
    }
}

export class React<E = any> {
    readonly target: Model;
    readonly handler: E;

    constructor(
        target: Model,
        handler: E
    ) {
        this.target = target;
        this.handler = handler;
    }
}
