import { Model } from "@//model";
import { Player } from "./player";
import { App } from "./app";

@Model.useProduct("game")
@App.useSingleton()
export class Game extends Model<{
    type: "game";
    memoState: {},
    tempState: {},
    childDict: {
        redPlayer: Player,
        bluePlayer: Player,
    },
    childList: {
    }
}> {
    private static _main: Game;
    static get main() {
        if (!Game._main) {
            throw new Error("Game not initialized");
        }
        return Game._main;
    }

    constructor(
        seq: Model.Seq<Game>,
        parent: Model.Parent<Game>
    ) {
        super({
            ...seq,
            childDict: {
                redPlayer: { type: 'player' },
                bluePlayer: { type: 'player' },
                ...seq.childDict
            },
            childList: {
                ...seq.childList
            },
            memoState: {
                ...seq.memoState
            },
            tempState: {
            }
        }, parent);
        Game._main = this;  
    }
}
