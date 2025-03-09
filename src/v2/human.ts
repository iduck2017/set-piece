import { BaseValue } from "./common";
import { Def, SuperDef } from "./define";
import { BaseModel, Model } from "./model";
import { BaseOuterPartyModel } from "./outer-party";

export type HumanDef = {
    code: string,
    state: Record<string, BaseValue> & { nickname?: string },
    child: Record<string, BaseModel> & { daughter: BaseHumanModel },
    event: Record<string, any> & { onBorn: void, onHello: BaseHumanModel },
    refer: Record<string, BaseModel> & { enemy?: BaseHumanModel },
    stateInner: Record<string, BaseValue> & { isAlive: boolean, age: number, name?: string },
    childGroup: Record<string, BaseModel[]> & { sons: BaseHumanModel[] },
    referGroup: Record<string, BaseModel[]> & { friends: BaseHumanModel[] }
    parent: BaseHumanModel
}

export abstract class BaseHumanModel<
    T extends HumanDef = HumanDef,
> extends Model<T> {
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
        this.childGroup.sons[0].child.daughter;
        this.childAgent.daughter = { code: "human" };
        // this.childAgent.son = { code: "human" };
        // this.childAgent.son.state?.name;
        // this.childAgent.son.state?.isAlive;
        this.eventEmitters.onHello(this.child.daughter);
        this.event.onBorn;
        this.eventEmitters.onBorn(undefined)
        this.eventEmitters.onHello(this.child.daughter);
        this.childAgent.daughter.state?.isAlive;
        this.refer.enemy;
        this.referGroup.friends[0];
        this.childGroup.sons[0].state.age;
        this.childGroupAgent.sons?.[0].state?.age;
        this.childGroupAgent.sons?.push({ code: 'human' })
        this.decor.nickname;

        this.agent.child.daughter?.child.daughter?.childGroup.sons?.childGroup.sons?.event.onBorn
    }

    @Model.useEvent((model) => model.event.onBorn)
    onBorn(target: BaseHumanModel, event: void) {
        console.log(target, event)
        target.child.aaa;
    }

    @Model.useEvent((model) => model.agent.child.daughter?.event.onHello)
    onChildBorn(target: BaseHumanModel, to: BaseHumanModel) {
        console.log(target, to)
    }

}

export abstract class HumanModel<
    T extends SuperDef<HumanDef>
> extends BaseHumanModel<T & HumanDef> {}