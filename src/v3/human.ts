import { BaseValue } from "./common";
import { BaseModel, Model } from "./model";
import { BaseOuterPartyModel } from "./outer-party";

// export type HumanDef = {
//     code: string,
//     state: { nickname?: string },
//     child: { daughter: BaseHumanModel },
//     event: { onBorn: void, onHello: BaseHumanModel },
//     refer: { enemy?: BaseHumanModel },
//     stateInner: { isAlive: boolean, age: number, name?: string },
//     childGroup: { sons: BaseHumanModel[] },
//     referGroup: { friends: BaseHumanModel[] }
//     parent: BaseHumanModel
// }

export type BaseHumanModel = HumanModel<
    string,
    HumanModel.Event,
    HumanModel.State,
    HumanModel.StateInner,
    HumanModel.Child,
    HumanModel.ChildGroup,
    HumanModel.Refer,
    HumanModel.ReferGroup,
    BaseHumanModel | undefined
    // Partial<HumanModel.Event> & Record<string, any>,
    // Partial<HumanModel.State> & Record<string, BaseValue>,
    // Partial<HumanModel.StateInner> & Record<string, BaseValue>,
    // Partial<HumanModel.Child> & Record<string, BaseModel>,
    // Partial<HumanModel.ChildGroup> & Record<string, BaseModel[]>,
    // Partial<HumanModel.Refer> & Record<string, BaseModel>,
    // Partial<HumanModel.ReferGroup> & Record<string, BaseModel[]>,
    // HumanModel.Parent & BaseModel | undefined
>

export namespace HumanModel {
    export type State = { nickname?: string }
    export type Child = { son: BaseHumanModel }
    export type Refer = { enemy?: BaseHumanModel }
    export type Event = { onBorn: void, onHello: BaseHumanModel }
    export type StateInner = { isAlive: boolean, age: number, name?: string }
    export type ChildGroup = { daughters: BaseHumanModel[] }
    export type ReferGroup = { friends: BaseHumanModel[] }
    export type Parent = BaseHumanModel
}

export abstract class HumanModel<
    I extends string,
    E extends Partial<HumanModel.Event> & Record<string, any>,
    S extends Partial<HumanModel.State> & Record<string, BaseValue>,
    D extends Partial<HumanModel.StateInner> & Record<string, BaseValue>,
    C extends Partial<HumanModel.Child> & Record<string, BaseModel>,
    G extends Partial<HumanModel.ChildGroup> & Record<string, BaseModel[]>,
    R extends Partial<HumanModel.Refer> & Record<string, BaseModel>,
    Q extends Partial<HumanModel.ReferGroup> & Record<string, BaseModel[]>,
    P extends BaseModel | undefined,
> extends Model<
    I, 
    E & HumanModel.Event,
    S & HumanModel.State,
    D & HumanModel.StateInner,
    C & HumanModel.Child,
    G & HumanModel.ChildGroup,
    R & HumanModel.Refer,
    Q & HumanModel.ReferGroup,
    P & HumanModel.Parent
> {
    static superProps<T extends BaseHumanModel>(props: Model.Props<T>) {
        return {
            ...props,
            state: {
                isAlive: true,
                age: 30,
                ...props.state,
            },
            child: {
                daughter: {
                    code: 'human',
                    state: { age: 10 }
                },
                ...props.child,
            }
        }
    }

    test() {
        this.state.age;
        this.state.isAlive;
        this.state.nickname;
        this.state.name;
        this.child.daughter;
        this.childGroup.daughters[0].child.son.state.age
        this.childGroupAgent.daughters?.push({ code: "human" })
        // this.childAgent.son = { code: "human" };
        // this.childAgent.son.state?.name;
        // this.childAgent.son.state?.isAlive;
        this.eventEmitters.onHello(this);
        this.event.onBorn;
        this.eventEmitters.onBorn(undefined)
        this.childGroupAgent.daughters?.[0].state?.nickname;
        this.refer.enemy;
        this.referGroup.friends[0];
        this.childGroup.daughters[0].state.age;
        this.childGroup.daughters.push(this.childGroup.daughters[0])
        this.childGroupAgent.daughters
        this.childAgent.son = {
            code: "human",
            state: { age: 10 }
        }
        this.decor.nickname;
        this.child.daughter;
    }

    @Model.useEvent((model) => model.event.onBorn)
    onBorn(target: BaseHumanModel, event: void) {
        console.log(target, event)
        const baseModel: BaseModel = this;
        const baseHumanModel: BaseHumanModel = this;
    }

    @Model.useEvent((model: BaseHumanModel) => model.agent.childGroup.daughters?.event.onHello)
    onChildBorn(target: BaseHumanModel, to: BaseHumanModel) {
    }

}
