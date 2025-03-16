import { OnChildChange } from "../model/event";
import { Model } from "../model/model";
import { OuterPartyDefine } from "./outer-party";
import { PetModel } from "./pet";

export namespace HumanDefine {
    export type I = OuterPartyDefine.I
    export type E = { onBorn: void, onHello: HumanModel, onCount: number }
    export type S1 = { nickname?: string, emotion: string }
    export type S2 = { isAlive: boolean, age: number, name: string }
    export type P = HumanModel
    export type C1 = { cat: PetModel }
    export type C2 = HumanModel
    export type R1 = { mother: HumanModel }
    export type R2 = { friends: HumanModel }
}

export  class HumanModel<
    I extends HumanDefine.I = HumanDefine.I,
    E extends Partial<HumanDefine.E> = {},
    S1 extends Partial<HumanDefine.S1> = {},
    S2 extends Partial<HumanDefine.S2> = {},
    P extends HumanDefine.P = HumanDefine.P,
    C1 extends Partial<HumanDefine.C1> = {},
    C2 extends HumanDefine.C2 = HumanDefine.C2,
    R1 extends Partial<HumanDefine.R1> = {},
    R2 extends Partial<HumanDefine.R2> = {}
> extends Model<
    I,
    E & HumanDefine.E,
    S1 & HumanDefine.S1,
    S2 & HumanDefine.S2,
    P,
    C1 & HumanDefine.C1,
    C2,
    R1 & HumanDefine.R1,
    R2 & HumanDefine.R2
> {
    static superProps<M extends HumanModel>(props: Model.Props<M>) {
        return {
            ...props,
            state: { ...props.state, isAlive: true, age: 20 },
        }
    }
    
    test() {
        const human: HumanModel = this;
        const age: number = human.state.age;
        const isAlive: boolean = human.state.isAlive;
        const name: string = human.state.name;
        const nickname: string = human.state.nickname ?? '';
        const emotion: string = human.state.emotion;
        human.stateDelegator.age += 10;
        human.stateDelegator.emotion = 'happy';
        human.stateDelegator.isAlive = true;
        human.stateDelegator.nickname = '';
        this.eventEmitters.onBorn(undefined);
        this.eventEmitters.onCount(4);
        this.eventEmitters.onHello(this.parent);
        const cat: PetModel | undefined = this.child.cat;
        this.childDelegator.cat?.state?.age;
        this.child.cat?.state.age;
        this.childDelegator.cat = { code: 'pet' };
        const employee: HumanModel = this.child[0];
        this.childDelegator.push({ code: 'thinkpol', state: { isAlive: false } });
        const mother: HumanModel | undefined= this.refer.mother;
        const friends: HumanModel | undefined = this.refer.friends?.[0];
        this.referDelegator.mother;
        this.eventEmitters.onCount(4)
    }
    
    @Model.useDecor((model: HumanModel) => model.decor.nickname)
    onNicknameCheck(target: HumanModel, state: string) { return state }

    @Model.useEvent((model) => model.event.onHello)
    onBorn(target: HumanModel, event: HumanModel) {}

    @Model.useEvent((model) => model.agent.event.onHello)
    onBorn2(target: HumanModel, to: HumanModel) {}

    @Model.useEvent((model: HumanModel) => model.agent.child[0].event.onHello)
    onBorn3(target: HumanModel, to: HumanModel) {}

    @Model.useEvent((model: HumanModel) => model.event.onChildChange)
    onChildChange(target: HumanModel, event: OnChildChange<HumanModel>) {
        console.log(event.next, event.prev)
    }
}
