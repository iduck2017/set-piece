import { OnChildChange } from "./event";
import { Model } from "./model";
import { PetModel } from "./pet";
import { ThinkPolModel } from "./thinkpol";

export namespace HumanDefine {
    export type Event = { onBorn: void; onSpeek: string; onHello: HumanModel, onCount: number }
    export type State = { nickname?: string, emotion: string }
    export type StateInner = { isAlive: boolean, age: number, name: string }
    export type Child = { cat?: PetModel }
    export type Parent = HumanModel;
    export type ChildGroup = HumanModel;
    export type Refer = { father?: HumanModel, mother: HumanModel }
    export type ReferGroup = HumanModel;
}

export abstract class HumanModel<
    E extends Partial<HumanDefine.Event> = {},
    S extends Partial<HumanDefine.State> = {},
    D extends Partial<HumanDefine.StateInner> = {},
    C extends Partial<HumanDefine.Child> = {},
    P extends HumanDefine.Parent = HumanDefine.Parent,
    I extends HumanDefine.ChildGroup = HumanDefine.ChildGroup,
    R extends Partial<HumanDefine.Refer> = {},
    Q extends HumanDefine.ReferGroup = HumanDefine.ReferGroup
> extends Model<
    E & HumanDefine.Event,
    S & HumanDefine.State,
    D & HumanDefine.StateInner,
    C & HumanDefine.Child,
    P,
    I,
    R & HumanDefine.Refer,
    Q
> {
    test() {
        const human: HumanModel = this;
        const age: number = human.state.age;
        const isAlive: boolean = human.state.isAlive;
        const name: string = human.state.name;
        const nickname: string = human.state.nickname ?? '';
        const emotion: string = human.state.emotion;
        human.stateAgent.age += 10;
        human.stateAgent.emotion = 'happy';
        human.stateAgent.isAlive = true;
        human.stateAgent.nickname = '';
        this.eventEmitter.onBorn(undefined);
        this.eventEmitter.onSpeek('Hello');
        this.eventEmitter.onCount(4);
        this.eventEmitter.onHello(this.parent);
        const cat: PetModel | undefined = this.child.cat;
        this.childAgent.cat?.state?.age;
        this.child.cat?.state.age;
        this.childAgent.cat = { type: PetModel };
        const employee: HumanModel = this.childGroup[0];
        this.childGroupAgent.push({ type: ThinkPolModel });
        const father: HumanModel | undefined = this.refer.father;
        const mother: HumanModel = this.refer.mother;
        const friends: HumanModel = this.referGroup[0];
        this.referAgent.father = human.refer.father;
        this.referAgent.mother = human.refer.mother;
        // this.referGroupAgent.push(human);
        this.eventEmitter.onCount(4)
    }
    
    @Model.useDecor((model: HumanModel) => model.decor.nickname)
    onNicknameCheck(target: HumanModel, state: string) { return state }

    @Model.useEvent((model) => model.event.onHello)
    onBorn(target: HumanModel, event: HumanModel) {}

    @Model.useEvent((model) => model.agent.event.onHello)
    onBorn2(target: HumanModel, to: HumanModel) {}

    @Model.useEvent((model: HumanModel) => model.agent.childGroup.event.onHello)
    onBorn3(target: HumanModel, to: HumanModel) {}

    @Model.useEvent((model: HumanModel) => model.event.onChildChange)
    onChildChange(target: HumanModel, event: OnChildChange<HumanModel>) {
        console.log(event.nextGroup, event.prevGroup)
    }
}
