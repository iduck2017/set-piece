import type { App } from "../app";
import { Base } from "../type";
import { EventReflect } from "../type/event";
import { Delegator } from "../utils/delegator";

export abstract class Renderer<
    E extends Base.Dict
> {
    private readonly $app: App;
    protected readonly $handlerDict: EventReflect.HandlerDict<E>;

    public get app() { return this.$app; }

    constructor(
        handlerExexcuteIntf: EventReflect.ExecuteIntf<E>,
        app: App
    ) {
        this.$app = app;
        this.$handlerDict = Delegator.initHandlerDict(
            handlerExexcuteIntf,
            {},
            this,
            app
        );
    }

    public deactive() {
        for (const key in this.$handlerDict) {
            this.$handlerDict[key].destroy();
        }
    }
}