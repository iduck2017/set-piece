import { SuperDef } from "./define";
import { BaseHumanModel, HumanDef, HumanModel } from "./human";
import { BaseInnerPartyModel } from "./inner-party";
import { PetModel } from "./pet";

type OuterPartyDef = HumanDef & {
    code: string;
    state: { salary: number };
    child: { cat?: PetModel, daughter: BaseOuterPartyModel }
    event: { onWork: void, onReport: BaseHumanModel },
    referGroup: { coworkers: BaseOuterPartyModel[] }
    refer: { leader: BaseInnerPartyModel }
    parent: BaseOuterPartyModel
}

export abstract class BaseOuterPartyModel<
    T extends OuterPartyDef = OuterPartyDef
> extends HumanModel<T> {
    test() {
        this.state.age;
        this.state.isAlive;
        this.state.name
        this.state.nickname;
        this.state.salary;
        this.child.cat;
        this.child.cat?.state.isAlive;
        this.child.cat?.state.nickname;
        this.childAgent.cat?.state?.nickname;
        this.childAgent.daughter.state?.salary;
        this.childAgent.daughter?.state?.age;
        this.childGroupAgent.sons[0] = { code: 'human' }
        this.eventEmitters.onReport(this.child.daughter);
        this.eventEmitters.onWork(undefined)
        this.event.onBorn;
        this.eventEmitters.onBorn(undefined)
    }
}
export abstract class OuterPartyModel<
    T extends SuperDef<OuterPartyDef>
> extends BaseOuterPartyModel<T & OuterPartyDef> {}

