import { IModel } from "@/model";

export class Event<E = any> {
    readonly target: IModel;

    constructor(
        target: IModel
    ) {
        this.target = target;
    }
}

export class React<E = any> {
    readonly target: IModel;
    readonly handler: E;

    constructor(
        target: IModel,
        handler: E
    ) {
        this.target = target;
        this.handler = handler;
    }
}
