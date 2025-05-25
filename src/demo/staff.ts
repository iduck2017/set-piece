import { HumanDefine, HumanModel } from "./human";
import { BaseDefine, Model } from "../model";

export namespace StaffDefine {

    export type P = StaffModel

    export type E = {
        onReport: StaffModel
        onWork: void;
        onHello: StaffModel;
    }

    export type S2 = {}
    export type S1 = {
        salary: number
        level: number
    }

    export type C1 = {}
    export type C2 = {
        features: FeatureModel,
        subordinates: StaffModel
    }

    export type R1 = {
        spouse?: StaffModel
    }
    export type R2 = {
        comrades: StaffModel
        enemies: StaffModel
    }

}

export class StaffModel<
    P extends StaffDefine.P = StaffDefine.P,
    E extends BaseDefine.E & Partial<StaffDefine.E & HumanDefine.E> = {},
    S1 extends BaseDefine.S & Partial<StaffDefine.S1> = {},
    S2 extends BaseDefine.S & Partial<StaffDefine.S2> = {},
    C1 extends BaseDefine.C & Partial<StaffDefine.C1> = {},
    C2 extends BaseDefine.C & Partial<StaffDefine.C2> = {},
    R1 extends BaseDefine.R & Partial<StaffDefine.R1> = {},
    R2 extends BaseDefine.R & Partial<StaffDefine.R2> = {},
> extends HumanModel<
    P,
    E & StaffDefine.E,
    S1 & StaffDefine.S1,
    S2 & StaffDefine.S2,
    C1 & StaffDefine.C1,
    C2 & StaffDefine.C2,
    R1 & StaffDefine.R1,
    R2 & StaffDefine.R2
> {

    static superProps<T extends StaffModel>(props?: Model.Props<T>) {
        const superProps = HumanModel.superProps(props);
        const subordinates: StaffModel[] = [];
        const spouse: StaffModel | undefined = undefined;
        return {
            ...superProps,
            state: {
                salary: 1000,
                level: 1,
                ...superProps?.state,
            },
            child: {
                features: [],
                ...superProps?.child,
                subordinates,
                ...props?.child,
            },
            refer: {
                comrades: [],
                enemies: [],
                ...superProps?.refer,
                spouse,
                ...props?.refer,
            }
        }
    }

    public work() {}
    
}



export class FeatureModel extends Model {
    public apply() {}
}
