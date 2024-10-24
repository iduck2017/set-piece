import { BaseModelDef, ModelDef, TmplModelDef } from "../type/model/define";
import { Model } from ".";
import { FeatModelDef } from "./feat";

export type CardModelDef<
    D extends BaseModelDef = ModelDef
> = TmplModelDef<D & {
    state: {
        readonly name: string,
        readonly desc: string,
    },
    childDict: {
        feat?: FeatModelDef
    }
}>

export abstract class CardModel<
    D extends CardModelDef<ModelDef>
> extends Model<D> {
    
}
