import type { App } from "../app";
import { Base } from "../type";
import { Entity } from "../utils/entity";
import { HandlerProxy } from "../utils/handler-proxy";

export abstract class Renderer<
    E extends Base.Dict
> extends Entity {
    protected readonly $handlerProxy: HandlerProxy<E>;

    constructor(
        app: App
    ) {
        super(app);
        this.$handlerProxy = new HandlerProxy(
            {},
            this,
            app
        );
    }

    public destroy() {
        console.log("Renderer destroyed", this);
        this.$handlerProxy.destroy();
    }
}