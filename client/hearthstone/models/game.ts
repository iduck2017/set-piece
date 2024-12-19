import { PlayerModel } from "./player";
import { CustomDef, Def, Factory, NodeModel, Props } from "@/set-piece";

type GameDef = CustomDef<{
    code: 'game',
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

    nextRound() {
        this.eventDict.onRoundEnd();
        this.baseStateDict.round += 1;
        this.eventDict.onRoundStart();
    }
}