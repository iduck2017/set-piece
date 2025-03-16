import { HumanDefine, HumanModel } from "./human";
import { Model } from "./model";
import { PetModel } from "./pet";
import { ObjectUtils } from "./struct";


export namespace OuterPartyDefine {
    export type E = Partial<HumanDefine.E> & { onWork: void; onReport: OuterPartyModel }
    export type S1 = Partial<HumanDefine.S1> & { salary: number }
    export type S2 = Partial<HumanDefine.S2> & { seniority: number }
    export type P = OuterPartyModel
    export type C1 = Partial<HumanDefine.C1> & { cat: PetModel, dog?: PetModel }
    export type C2 = OuterPartyModel
    export type R1 = Partial<HumanDefine.R1> & { father: OuterPartyModel, introducer: OuterPartyModel }
    export type R2 = Partial<HumanDefine.R2> & { enemies: OuterPartyModel }
}

export class OuterPartyModel<
    E extends Partial<OuterPartyDefine.E> = {},
    S1 extends Partial<OuterPartyDefine.S1> = {},
    S2 extends Partial<OuterPartyDefine.S2> = {},
    P extends OuterPartyDefine.P = OuterPartyDefine.P,
    C1 extends Partial<OuterPartyDefine.C1> = {},
    C2 extends OuterPartyDefine.C2 = OuterPartyDefine.C2,
    R1 extends Partial<OuterPartyDefine.R1> = {},
    R2 extends Partial<OuterPartyDefine.R2> = {}
> extends HumanModel<
    E & OuterPartyDefine.E,
    S1 & OuterPartyDefine.S1,
    S2 & OuterPartyDefine.S2,
    P,
    C1 & OuterPartyDefine.C1,
    C2,
    R1 & OuterPartyDefine.R1,
    R2 & OuterPartyDefine.R2
> {
    static superProps<M extends OuterPartyModel>(props: Model.Props<M>) {
        const superProps = HumanModel.superProps(props);
        return {
            ...superProps,
            child: ObjectUtils.merge(superProps.child ?? [], { cat: { type: PetModel } })
        }
    }

    test() {
        const model: Model = this;
        const human: HumanModel = this;
        const emotion: string = this.state.emotion;
        const outerParty: OuterPartyModel = this;
        const salarty: number = this.state.salary;
        const seniority: number = this.state.seniority;
        const dog: PetModel | undefined = this.child.dog;
        const cat: PetModel = this.child.cat;
        const a: OuterPartyModel = [...this.child][0]
        this.childDelegator.dog?.state?.age;
        this.child.dog?.state.age;
        this.eventEmitters.onWork(undefined)
        this.eventEmitters.onReport(this.parent)
        const introducer: OuterPartyModel | undefined = this.refer.introducer;
        const introducer2: OuterPartyModel | undefined = this.referDelegator.introducer;
        this.referDelegator.introducer = this.refer.father;
        const friend: HumanModel | undefined = this.refer.friends[0];
        const enemies: OuterPartyModel | undefined = this.refer.enemies[0];
    }
}
