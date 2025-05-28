import { HumanDefine, HumanModel } from "./human";
import { Define, Model } from "../model";

export namespace StaffDefine {

    export type P = StaffModel

    export type E = {
        onReport: StaffModel
        onWork: void;
        onHello: StaffModel;
    }

    export type S = {
        salary: number
        level: number
    }

    export type C = {
        features: FeatureModel[],
        subordinates: StaffModel[]
    }

    export type R = {
        spouse?: StaffModel
        comrades: StaffModel[]
        enemies: StaffModel[]
    }

}

export class StaffModel<
    P extends StaffDefine.P = StaffDefine.P,
    E extends Define.E & Partial<StaffDefine.E & HumanDefine.E> = {},
    S extends Define.S & Partial<StaffDefine.S & HumanDefine.S> = {},
    C extends Define.C & Partial<StaffDefine.C & HumanDefine.C> = {},
    R extends Define.R & Partial<StaffDefine.R & HumanDefine.R> = {},
> extends HumanModel<
    P,
    E & StaffDefine.E,
    S & StaffDefine.S,
    C & StaffDefine.C,
    R & StaffDefine.R
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
