import { Node } from "@/model/node";

export class Event<E = any> {
    readonly target: Node;

    constructor(
        target: Node
    ) {
        this.target = target;
    }
}

export class React<E = any> {
    readonly target: Node;
    readonly handler: E;

    constructor(
        target: Node,
        handler: E
    ) {
        this.target = target;
        this.handler = handler;
    }
}
