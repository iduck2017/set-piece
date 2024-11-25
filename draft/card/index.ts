import { Model } from "@/model";
import { Def } from "@/type/define";
import { Minion } from "../minion";

export type MinionCard = Card<Def & {
    childDict: {
        minion: Minion
    }
}>

export abstract class Card<
    T extends Partial<Def> = {}
> extends Model<T & {
    memoState: {},
    tempState: {
        readonly name: string;
        readonly desc: string;
    },
    childDict: {},
    childList: {}
}> {
}
