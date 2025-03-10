import { HumanModel } from "./human";
import { Model } from "./model";

export namespace PetDefine {
    export type Event = { onBorn: void; onPlay: HumanModel; onFight: PetModel }
    export type State = { name?: string };
    export type StateInner = { age: number, isAlive: boolean };
    export type Child = {};
    export type ChildGroup = Model;
    export type Parent = HumanModel;
}

export class PetModel extends Model<
    PetDefine.Event,
    PetDefine.State,
    PetDefine.StateInner,
    PetDefine.Child,
    PetDefine.Parent,
    PetDefine.ChildGroup
> {
    test() {
        const pet: PetModel = this;
        const age: number = pet.state.age;
        const isAlive: boolean = pet.state.isAlive;
        const name: string = pet.state.name ?? '';
        pet.stateAgent.age += 10;
        pet.stateAgent.isAlive = true;
        pet.stateAgent.name = 'Tom';
        this.parent;
        this.eventEmitter.onBorn();
        this.eventEmitter.onPlay(this.parent);
        this.eventEmitter.onFight(this)
    }
}
