import type { App } from "../app";
import { Base } from "../type";
import { CursorType } from "../type/cursor";
import { HandlerProxy } from "../utils/handler-proxy";

export abstract class Renderer<
    E extends Base.Dict
> {
    private readonly $app: App;
    protected readonly $handlerProxy: HandlerProxy<E>;

    public get app() { return this.$app; }

    constructor(
        callbackIntf: CursorType.HandleEventIntf<E>,
        app: App
    ) {
        this.$app = app;
        this.$handlerProxy = new HandlerProxy(
            callbackIntf,
            {},
            this,
            app
        );
    }

    public destroy() {
        this.$handlerProxy.destroy();
    }
}