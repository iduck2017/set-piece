import { Model } from "set-piece";


export namespace DemoDefine {
    export type I = 'demo';
    export type E = {}
    export type S1 = { foo: number };
    export type S2 = { bar: string };
}

export class DemoModel extends Model<
    DemoDefine.I,
    DemoDefine.E,
    DemoDefine.S1,
    DemoDefine.S2
> {
    constructor(props: Model.Props<DemoModel>) {
        super({
            ...props,
            state: { foo: 0, bar: 'bar', ...props.state },
            child: {},
            refer: {},
        })
    }
}