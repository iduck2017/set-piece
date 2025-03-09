import { SuperDef } from "./define";
import { BaseHumanModel, HumanModel } from "./human";
import { BaseOuterPartyModel } from "./outer-party";
import { PetModel } from "./pet";

export namespace InnerPartyModel {
    export type State = HumanModel.State & {}
    export type Child = HumanModel.Child & { dog: PetModel, cat: PetModel }
    export type Refer = HumanModel.Refer & {}
    export type Event = HumanModel.Event & { onCommand: BaseOuterPartyModel }
    export type StateInner = HumanModel.StateInner & { power: number }
    export type ChildGroup = HumanModel.ChildGroup & {  }
    export type ReferGroup = HumanModel.ReferGroup & { friends: BaseHumanModel[] }
    export type Parent = HumanModel.Parent & BaseHumanModel
}


type BaseInnerPartyModel = InnerPartyModel<
    string,
    Partial<InnerPartyModel.State> & Record<string, BaseValue>,
    Partial

>


export abstract class InnerPartyModel<
> extends HumanModel<T> {
    test() {
        this.state.salary;
        this.child.cat;
        this.child.daughter;
        this.child.son;
        this.eventEmitters.onOrder(this.referGroup.stuff[0])
        this.eventEmitters.onHello(this.child.daughter);
        this.eventEmitters.onHello(this.parent);
        // this.eventEmitters.onHello(this.referGroup.stuff[0]);
        this.eventEmitters.onHello(this.referGroup.coworkers[0]);
        this.childGroupAgent.sons.push({ code: 'human'})
        this.referGroup.coworkers[0];
    }
}

export abstract class InnerPartyModel<
    T extends SuperDef<InnerPartyDef>
> extends BaseInnerPartyModel<T & InnerPartyDef> {}

