import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";
import { AppModel } from "../app";
import { NodeModel } from "../node";
import { Def } from "@/type/define";
import { Props } from "@/type/props";
import { PlayerModel } from "./player";
import { DataBase } from "@/service/database";

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