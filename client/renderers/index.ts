import type { App } from "../app";
import { Base } from "../type";
import { LinkerType } from "../type/linker";
import { HandlerProxy } from "../utils/handler-proxy";

export abstract class Renderer<
    E extends Base.Dict
> {
    private readonly $app: App;
    protected readonly $handlerProxy: HandlerProxy<E>;

    public get app() { return this.$app; }

    constructor(
        callbackIntf: LinkerType.HandlerIntf<E>,
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