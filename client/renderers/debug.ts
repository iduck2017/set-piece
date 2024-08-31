import type { App } from "../app";
import { Model } from "../models";
import { IBase } from "../type";
import { IEvent } from "../type/event";
import { Renderer } from ".";
import { IModelDef } from "../type/definition";

export class DebugRenderer<
    M extends IModelDef.Default = IModelDef.Default
> extends Renderer<{
    stateUpdateDone: IEvent.StateUpdateDone<M>
    childUpdateDone: IEvent.ChildUpdateDone<M>
}> {
    private readonly $setState: IBase.Func;
    private readonly $setChildren: IBase.Func;

    constructor(
        setState: IBase.Func,
        setChildren: IBase.Func,
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

    private handleStateUpdateDone(event: IEvent.StateUpdateDone<M>) {
        this.$setState(event.state);
    }

    private handleChildUpdateDone(event: IEvent.ChildUpdateDone<M>) {
        this.$setChildren(event.children);
    }

    public active(target: Model<M>) {
        target.emitterBinderDict.stateUpdateDone(
            this.$handlerProxy.handlerDict.stateUpdateDone
        );
        target.emitterBinderDict.childUpdateDone(
            this.$handlerProxy.handlerDict.childUpdateDone
        );
    }
}