import { Model } from "@//model";
import { Card } from '.';
import { Minion } from "../minion";

@Model.useProduct("wisp")
@Minion.useRule({
    curAttack: 1,
    curHealth: 1,
    maxHealth: 1,
    rawAttack: 1
})
export class Wisp extends Card<{
    type: "wisp";
    memoState: {},
    tempState: {},
    childDict: {
        minion: Minion,
    },
    childList: {}
}> {
    constructor(
        seq: Model.Seq<Wisp>,
        parent: Model.Parent<Wisp>
    ) {
        super({
            ...seq,
            childDict: {
                minion: { type: 'minion' },
                ...seq.childDict
            },
            childList: {
                ...seq.childList
            },
            memoState: {
                ...seq.memoState
            },
            tempState: {
                name: "Wisp",
                desc: "A tiny wisp"
            }
        }, parent);
    }
}
