import { Model } from "../model"
import { StaffModel } from "./staff"

export namespace WinstonDefine {
    export type P = StaffModel
    export type E = {
        onBetray: StaffModel,
        onHello: StaffModel,
    }
    export type S1 = {}
    export type S2 = {}
    export type C1 = {
        lover: StaffModel
    }
    export type C2 = {}
    export type R1 = {}
    export type R2 = {}
}


export class WinstonModel extends StaffModel<
    WinstonDefine.P,
    WinstonDefine.E,
    WinstonDefine.S1,
    WinstonDefine.S2,
    WinstonDefine.C1,
    WinstonDefine.C2,
    WinstonDefine.R1,
    WinstonDefine.R2
> {
    constructor(props?: Model.Props<WinstonModel>) {
        const superProps = StaffModel.superProps(props);
        super({
            ...superProps,
            state: {
                ...superProps?.state,
            },
            child: {
                lover: new WinstonModel(),
                ...superProps?.child,
            },
            refer: {
                ...superProps?.refer,
            },
        })

        const age: number = this.state.age
        this.event.onBetray(this)
        // this.state.tags.push('world')
        this.draft.state.tags = ['aa'];
        // this.state.aaa;

    }

    
}
