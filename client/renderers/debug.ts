import type { App } from "../app";
import { Model } from "../models";
import { Base } from "../type";
import { Event } from "../type/event";
import { ModelTmpl } from "../type/template";
import { Renderer } from ".";

export class DebugRenderer<
    M extends ModelTmpl
> extends Renderer<{
    stateUpdateDone: Event.StateUpdateDone<M>
    childUpdateDone: Event.ChildUpdateDone<M>
}> {
    constructor(
        setState: Base.Func,
        setChildren: Base.Func,
        app: App
    ) {
        super({
            stateUpdateDone: (event: Event.StateUpdateDone<M>) => {
                setState(event.target.currentState);
            },
            childUpdateDone: (data: Event.ChildUpdateDone<M>) => {
                setChildren(data.target.currentChildren);
            }
        }, app);
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