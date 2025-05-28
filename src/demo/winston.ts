import { Model } from "../model"
import { StaffModel } from "./staff"

export namespace WinstonDefine {
    export type P = StaffModel
    export type E = {
        onBetray: StaffModel,
        onHello: StaffModel,
    }
    export type S = {}
    export type C = {
        lover: StaffModel
    }
    export type R = {}
}


export class WinstonModel extends StaffModel<
    WinstonDefine.P,
    WinstonDefine.E,
    WinstonDefine.S,
    WinstonDefine.C,
    WinstonDefine.R
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
                vice: new WinstonModel(),
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
