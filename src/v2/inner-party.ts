import { SuperDef } from "./define";
import { HumanDef, HumanModel } from "./human";
import { BaseOuterPartyModel } from "./outer-party";
import { PetModel } from "./pet";

type InnerPartyDef = HumanDef & {
    code: string;
    state: { salary: number, power: number };
    child: { cat?: PetModel, dog?: PetModel, daughter: BaseInnerPartyModel, son: BaseInnerPartyModel }
    event: { onOrder: BaseOuterPartyModel },
    referGroup: { coworkers: BaseInnerPartyModel[], stuff: BaseOuterPartyModel[] }
    parent: BaseInnerPartyModel
}

export abstract class BaseInnerPartyModel<
    T extends InnerPartyDef = InnerPartyDef
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

