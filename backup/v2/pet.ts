import { Model } from "./model";
import { BaseHumanModel } from "./human";
import { BaseOuterPartyModel } from "./outer-party";

export class PetModel extends Model<{ 
    code: 'pet'
    state: { nickname: string, isAlive: boolean },
    event: { onPlay: BaseHumanModel },
    parent: BaseOuterPartyModel;
}> {
    test() {
        this.state.nickname;
        this.state.isAlive;
        this.child;
        this.parent.state.salary;
        this.event.onPlay;
    }
}