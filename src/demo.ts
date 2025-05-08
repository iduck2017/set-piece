import { EventAgent } from "./agent/event";
import { StateAgent } from "./agent/state";
import { Model } from "./model";

export namespace DemoDefine {
    export type E = { onPing: number }
    export type S1 = { foo: number };
    export type S2 = { bar: string };
    export type P = never;
    export type C1 = { foo: Model, bar?: Model };
    export type C2 = Model;
    export type R1 = { foo: Model, bar?: Model };
    export type R2 = { baz: Model[] };
}

export class DemoModel extends Model<
    DemoDefine.E,
    DemoDefine.S1,
    DemoDefine.S2,
    DemoDefine.P,
    DemoDefine.C1,
    DemoDefine.C2,
    DemoDefine.R1,
    DemoDefine.R2
> {
    constructor(props: Model.Props<DemoModel>) {
        super({
            ...props,
            state: { foo: 0, bar: 'bar', ...props.state },
            child: { foo: new DemoModel({}) },
            refer: { baz: [] },
        })
    }

    @StateAgent.use(proxy => proxy.decor.foo)
    handleState(target: DemoModel, foo: number) {
        return foo + 1;
    }

    @EventAgent.use(proxy => proxy.event.onPing)
    handleEvent(target: DemoModel, event: number) {
        console.log
    }


}