import { Model } from "@/model";
import { Factory } from "@/service/factory";

export class Event<E = any> {
    readonly target: Model;
    public readonly key: string;
    public readonly uuid: string;

    constructor(
        target: Model,
        key: string
    ) {
        this.target = target;
        this.key = key;
        this.uuid = Factory.uuid;
    }
}

export class React<E = any> {
    readonly target: Model;
    readonly handler: E;
    public readonly uuid: string;

    constructor(
        target: Model,
        handler: E
    ) {
        this.target = target;
        this.handler = handler;
        this.uuid = Factory.uuid;
    }
}
