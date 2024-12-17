import { PlayerModel } from "./player";
import { DataBase } from "@/hearthstone/services/database";
import { Def, Factory, Lifecycle, NodeModel, Props } from "@/set-piece";
import { AppModel } from "./app";

type GameDef = Def.Create<{
    code: 'game',
    parent: AppModel,
    stateDict: {
        round: number
    }
    childDict: {
        redPlayer: PlayerModel,
        bluePlayer: PlayerModel
    }
    eventDict: {
        onRoundEnd: []
        onRoundStart: []
    }
}>

@Factory.useProduct('game')
export class GameModel extends NodeModel<GameDef> {
    private static _core?: GameModel;
    static get core(): GameModel {
        if (!GameModel._core) {
            console.error('[game-uninited]');
            throw new Error();
        }
        return GameModel._core;
    }

    constructor(props: Props<GameDef>) {
        super({
            ...props,
            childDict: {
                redPlayer: { code: 'player' },
                bluePlayer: { code: 'player' },
                ...props.childDict
            },
            stateDict: {
                round: 0,
                ...props.stateDict
            },
            paramDict: {}
        });
    } 
   

    @Lifecycle.useLoader()
    private _register() {
        GameModel._core = this;
    }

    @Lifecycle.useUnloader()
    private _unregister() {
        delete GameModel._core;
    }

    checkDatabase() {
        console.log(DataBase.cardProductInfo);
    }

    nextRound() {
        this.eventDict.onRoundEnd();
        this.baseStateDict.round += 1;
        this.eventDict.onRoundStart();
    }
}