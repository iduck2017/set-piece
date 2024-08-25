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
                setState(event.target.state);
            },
            childUpdateDone: (data: Event.ChildUpdateDone<M>) => {
                setChildren(data.target.children);
            }
        }, app);
    }

    public active(target: Model<M>) {
        target.emitterBindIntf.stateUpdateDone(this.$handlerDict.stateUpdateDone);
        target.emitterBindIntf.childUpdateDone(this.$handlerDict.childUpdateDone);
    }
    
}