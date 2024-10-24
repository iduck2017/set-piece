import { BaseModelDef, ModelDef } from "../type/model/define";
import { CardModel, CardModelDef } from "./card";

export type WeaponModelDef<
    D extends BaseModelDef
> = CardModelDef<D & {
    state: {
        curDurability: number;
        maxDurability: number;
        curAttack: number;
    }
}>

export abstract class WeaponModel<
    D extends WeaponModelDef<ModelDef>
> extends CardModel<D> {
    
}