import { Factory } from "@/service/factory";
import { IModel, Model } from ".";
import { ChunkOf } from "@/type/model";
import { Player } from "./player";
import { Lifecycle } from "@/service/lifecycle";

@Factory.useProduct('game')
export class Game extends IModel<
    'game',
    {},
    {
        redPlayer: Player
        bluePlayer: Player
    },
    {}
> {
    private static _main?: Game;
    static get main(): Game {
        if (!Game._main) {
            console.error('GameUninited');
            throw new Error();
        }
        return Game._main;
    }

    constructor(
        chunk: ChunkOf<Game>,
        parent: Model
    ) {
        super({
            ...chunk,
            child: {
                redPlayer: { 
                    code: "player",
                    state: {
                        camp: 'red'
                    }
                },
                bluePlayer: { 
                    code: 'player',
                    state: {
                        camp: 'blue'
                    }
                },
                ...chunk.child
            },
            state: {}
        }, parent);
    }

    @Lifecycle.useLoader()
    private _onLoad() {
        Game._main = this;
    }

    @Lifecycle.useUnloader()
    private _onUnload() {
        Game._main = undefined;
    }
}