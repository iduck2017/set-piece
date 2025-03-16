import { HumanModel } from "./human"
import { Model } from "../model/model"
import { OuterPartyDefine, OuterPartyModel } from "./outer-party"
import { PetModel } from "./pet"

export namespace ThinkPolDefine {
    export type I = 'thinkpol'
    export type E = Partial<OuterPartyDefine.E> & { onSpy: OuterPartyModel }
    export type S1 = Partial<OuterPartyDefine.S1> & { alias: string }
    export type S2 = Partial<OuterPartyDefine.S2>
    export type P = OuterPartyDefine.P
    export type C1 = Partial<OuterPartyDefine.C1> & { dog: PetModel }
    export type C2 = OuterPartyDefine.C2
    export type R1 = Partial<OuterPartyDefine.R1> & { target: OuterPartyModel }
    export type R2 = Partial<OuterPartyDefine.R2>
}

export class ThinkPolModel extends OuterPartyModel<
    ThinkPolDefine.I,
    ThinkPolDefine.E,
    ThinkPolDefine.S1,
    ThinkPolDefine.S2,
    ThinkPolDefine.P,
    ThinkPolDefine.C1,
    ThinkPolDefine.C2,
    ThinkPolDefine.R1,
    ThinkPolDefine.R2
> {
    constructor(props: Model.Props<ThinkPolModel>) {
        const superProps = OuterPartyModel.superProps(props);
        super({
            ...props,
            state: {
                ...superProps.state,
                alias: 'thinkpol',
                salary: 10000,
                emotion: 'happy',
                seniority: 1,
                name: 'thinkpol',
            },
            child: {
                ...superProps.child,
                dog: { code: 'pet' }
            },
            refer: {
                ...superProps.refer,
                friends: [],
                enemies: []
            }
        });
    }

    test() {
        const dog: PetModel = this.child.dog;
        this.childDelegator.dog = { code: 'pet' };
        this.child.cat?.state.age;
        const model: Model = this;
        const outerParty: OuterPartyModel = this;
        const human: HumanModel = this
        this.eventEmitters.onHello(human);
        this.eventEmitters.onSpy(this);
        this.eventEmitters.onBorn();
        const cat: PetModel = this.child.cat;
    }

    
    @Model.useEvent((model) => model.event.onCount)
    onBorn4(target: HumanModel, event: number) {}

    @Model.useEvent((model) => model.agent.event.onHello)
    onBorn5(target: HumanModel, to: HumanModel) {}

    @Model.useEvent((model: HumanModel) => model.agent.child[0].event.onHello)
    onBorn6(target: HumanModel, to: HumanModel) {}
}
