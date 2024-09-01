import type { App } from "../app";
import { IBase } from "../type";
import { ConnectorType } from "../type/connector";
import { Entity } from "../utils/entity";
import { HandlerProxy } from "../utils/handler-proxy";

export abstract class Renderer<
    E extends IBase.Dict
> extends Entity {
    protected readonly $handlerProxy: HandlerProxy<E>;

    constructor(
        loader: ConnectorType.CallerDict<E>,
        app: App
    ) {
        super(app);
        this.$handlerProxy = new HandlerProxy(
            loader,
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