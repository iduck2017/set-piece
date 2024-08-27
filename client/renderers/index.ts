import type { App } from "../app";
import { Base } from "../type";
import { EventReflect } from "../type/event";
import { HandlerProxy } from "../utils/handler";

export abstract class Renderer<
    E extends Base.Dict
> {
    private readonly $app: App;
    protected readonly $handlerProxy: HandlerProxy<E>;

    public get app() { return this.$app; }

    constructor(
        handlerExexcuteIntf: EventReflect.ExecuteIntf<E>,
        app: App
    ) {
        this.$app = app;
        this.$handlerProxy = new HandlerProxy(
            handlerExexcuteIntf,
            {},
            this,
            app
        );
    }

    public destroy() {
        this.$handlerProxy.destroy();
    }
}