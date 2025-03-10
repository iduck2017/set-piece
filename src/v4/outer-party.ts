import { HumanDefine, HumanModel } from "./human";
import { Model } from "./model";
import { PetModel } from "./pet";

export namespace OuterPartyDefine {
    export type Event = Partial<HumanDefine.Event> & { onWork: void; onReport: OuterPartyModel };
    export type State = Partial<HumanDefine.State> & { salary: number };
    export type StateInner = Partial<HumanDefine.StateInner> & { seniority: number };
    export type Child = Partial<HumanDefine.Child> & { cat: PetModel, dog?: PetModel };
    export type Parent = OuterPartyModel;
    export type ChildGroup = OuterPartyModel;
    export type Refer = Partial<HumanDefine.Refer> & { father: OuterPartyModel, introducer: OuterPartyModel };
    export type ReferGroup = OuterPartyModel;
}

export class OuterPartyModel<
    E extends Partial<OuterPartyDefine.Event> = {},
    S extends Partial<OuterPartyDefine.State> = {},
    D extends Partial<OuterPartyDefine.StateInner> = {},
    C extends Partial<OuterPartyDefine.Child> = {},
    P extends OuterPartyDefine.Parent = OuterPartyDefine.Parent,
    I extends OuterPartyDefine.ChildGroup = OuterPartyDefine.ChildGroup,
    R extends Partial<OuterPartyDefine.Refer> = {},
    Q extends OuterPartyDefine.ReferGroup = OuterPartyDefine.ReferGroup
> extends HumanModel<
    E & OuterPartyDefine.Event,
    S & OuterPartyDefine.State,
    D & OuterPartyDefine.StateInner,
    C & OuterPartyDefine.Child,
    P,
    I,
    R & OuterPartyDefine.Refer,
    Q
> {
    test() {
        const model: Model = this;
        const human: HumanModel = this;
        const emotion: string = this.state.emotion;
        const outerParty: OuterPartyModel = this;
        const salarty: number = this.state.salary;
        const seniority: number = this.state.seniority;
        const dog: PetModel | undefined = this.child.dog;
        const cat: PetModel = this.child.cat;
        this.childAgent.dog?.state?.age;
        this.child.dog?.state.age;
        this.eventEmitter.onWork(undefined)
        this.eventEmitter.onReport(this.parent)
        const introducer: OuterPartyModel = this.refer.introducer;
        const introducer2: OuterPartyModel = this.referAgent.introducer;
        this.referAgent.introducer = this.refer.father;
        const friend: OuterPartyModel = this.referGroup[0];
    }
}
