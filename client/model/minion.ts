import { BaseModelDef, ModelDef } from "../type/model/define";
import { CardModel, CardModelDef } from "./card";

export type MinionModelDef<
    D extends BaseModelDef
> = CardModelDef<D & {
    state: {
        curAttack: number,
        curHealth: number,
        maxHealth: number,
        isAlive: boolean,
    }
}>

export abstract class MinionModel<
    D extends MinionModelDef<ModelDef>
> extends CardModel<D> {
    
}