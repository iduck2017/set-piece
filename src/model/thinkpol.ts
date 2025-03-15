import { HumanModel } from "./human"
import { Model } from "./model"
import { OuterPartyDefine, OuterPartyModel } from "./outer-party"
import { PetModel } from "./pet"

export namespace ThinkPolDefine {
    export type Event = Partial<OuterPartyDefine.Event> & { onSpy: OuterPartyModel }
    export type State = Partial<OuterPartyDefine.State> & { alias: string }
    export type StateInner = Partial<OuterPartyDefine.StateInner>
    export type Child = Partial<OuterPartyDefine.Child> & { dog: PetModel }
    export type Parent = OuterPartyModel 
    export type ChildGroup = OuterPartyModel
    export type Refer = Partial<OuterPartyDefine.Refer> & { target: OuterPartyModel }
    export type ReferGroup = OuterPartyModel
}

export class ThinkPolModel extends OuterPartyModel<
    ThinkPolDefine.Event,
    ThinkPolDefine.State,
    ThinkPolDefine.StateInner,
    ThinkPolDefine.Child,
    ThinkPolDefine.Parent,
    ThinkPolDefine.ChildGroup,
    ThinkPolDefine.Refer,
    ThinkPolDefine.ReferGroup
> {
    test() {
        const dog: PetModel = this.child.dog;
        this.childAgent.dog = { type: PetModel };
        this.child.cat?.state.age;
        const model: Model = this;
        const outerParty: OuterPartyModel = this;
        const human: HumanModel = this
        this.eventEmitter.onHello(human);
        this.eventEmitter.onSpy(this);
        this.eventEmitter.onBorn();
        const cat: PetModel = this.child.cat;
    }

    
    @Model.useEvent((model) => model.event.onCount)
    onBorn4(target: HumanModel, event: number) {}

    @Model.useEvent((model) => model.agent.event.onHello)
    onBorn5(target: HumanModel, to: HumanModel) {}

    @Model.useEvent((model: HumanModel) => model.agent.childGroup.event.onHello)
    onBorn6(target: HumanModel, to: HumanModel) {}
}
