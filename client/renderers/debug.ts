import type { App } from "../app";
import { Model } from "../models";
import { Base } from "../type";
import { EventType } from "../type/event";
import { ModelTmpl } from "../type/template";
import { Renderer } from ".";

export class DebugRenderer<
    M extends ModelTmpl = ModelTmpl
> extends Renderer<{
    stateUpdateDone: EventType.StateUpdateDone<M>
    childUpdateDone: EventType.ChildUpdateDone<M>
}> {
    private readonly $setState: Base.Func;
    private readonly $setChildren: Base.Func;

    constructor(
        setState: Base.Func,
        setChildren: Base.Func,
        app: App
    ) {
        super(app);
        this.$setState = setState;
        this.$setChildren = setChildren;
        this.$handlerProxy.initialize({
            stateUpdateDone: this.handleStateUpdateDone,
            childUpdateDone: this.handleChildUpdateDone
        });
    }

    private handleStateUpdateDone(event: EventType.StateUpdateDone<M>) {
        this.$setState(event.state);
    }

    private handleChildUpdateDone(event: EventType.ChildUpdateDone<M>) {
        this.$setChildren(event.children);
    }

    public active(target: Model<M>) {
        target.emitterProxy.binderIntf.stateUpdateDone(
            this.$handlerProxy.handlerDict.stateUpdateDone
        );
        target.emitterProxy.binderIntf.childUpdateDone(
            this.$handlerProxy.handlerDict.childUpdateDone
        );
    }
}