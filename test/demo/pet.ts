import { HumanModel } from "./human";
import { Model } from "../../src/model/model";

export namespace PetDefine {
    export type I = 'pet';
    export type E = { onBorn: void; onPlay: HumanModel; onFight: PetModel }
    export type S1 = { name?: string };
    export type S2 = { age: number, isAlive: boolean };
    export type P = HumanModel;
    export type C1 = {};
    export type C2 = Model;
}

export class PetModel extends Model<
    PetDefine.I,
    PetDefine.E,
    PetDefine.S1,
    PetDefine.S2,
    PetDefine.P,
    PetDefine.C1,
    PetDefine.C2
> {
    test() {
        const pet: PetModel = this;
        const age: number = pet.state.age;
        const isAlive: boolean = pet.state.isAlive;
        const name: string = pet.state.name ?? '';
        pet.stateDelegator.age += 10;
        pet.stateDelegator.isAlive = true;
        pet.stateDelegator.name = 'Tom';
        this.parent;
        this.eventEmitters.onBorn();
        this.eventEmitters.onPlay(this.parent);
        this.eventEmitters.onFight(this)
    }
}
