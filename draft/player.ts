import { Model } from "@//model";
import { Card, MinionCard } from "./card";

@Model.useProduct("player")
export class Player extends Model<{
    type: "player";
    memoState: {},
    tempState: {},
    childDict: {},
    childList: {
        desk: MinionCard[]
    }
}> {
    constructor(
        seq: Model.Seq<Player>,
        parent: Model.Parent<Player>
    ) {
        super({
            ...seq,
            childDict: {
                ...seq.childDict
            },
            childList: {
                desk: [ { type: 'wisp' } ],
                ...seq.childList
            },
            memoState: {
                ...seq.memoState
            },
            tempState: {
            }
        }, parent);
    }

    summon() {
        this._childList.desk.push(this._new({
            type: 'wisp'
        }));
    }
}
