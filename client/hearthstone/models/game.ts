import { RaceType } from "../services/database";
import { AppModel } from "./app";
import { MinionModel } from "./minion";
import { PlayerModel } from "./player";
import { CustomDef, FactoryService, Model, NodeModel, Props } from "@/set-piece";

type GameDef = CustomDef<{
    code: 'game',
    stateDict: {
        turn: number
    }
    childDict: {
        redPlayer: PlayerModel,
        bluePlayer: PlayerModel
    }
    eventDict: {
        onTurnEnd: []
        onTurnStart: []
    }
    parent: AppModel
}>

@FactoryService.useProduct('game')
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
                turn: 0,
                ...props.stateDict
            },
            paramDict: {}
        });
    } 

    nextTurn() {
        this.eventDict.onTurnEnd();
        this.baseStateDict.turn += 1;
        this.eventDict.onTurnStart();
    }

    queryMinionAndPlayerList(
        options: {
            excludePlayer?: boolean,
            excludeTarget?: Model,
            excludePosition?: PlayerModel,
            requiredRaces?: RaceType[]
        }
    ): (MinionModel | PlayerModel)[] {
        const {
            excludeTarget,
            requiredRaces,
            excludePosition,
            excludePlayer
        } = options;
        const readPlayer = this.childDict.redPlayer;
        const bluePlayer = this.childDict.bluePlayer;
        const redBoard = readPlayer.childDict.board;
        const blueBoard = bluePlayer.childDict.board;
        let result = [
            ...redBoard.childList,
            ...blueBoard.childList,
            readPlayer,
            bluePlayer
        ];
        if (excludePosition) {
            result = result.filter(item => {
                const player = item instanceof PlayerModel ?
                    item :
                    item.queryParent('player', true);
                if (!player) return false;
                return player !== excludePosition;
            });
        }
        if (excludeTarget) {
            result = result.filter(item => item !== excludeTarget);
        }
        if (excludePlayer) {
            result = result.filter(item => !(item instanceof PlayerModel));
        }
        if (requiredRaces) {
            result = result.filter((item: MinionModel) => {
                const combative = item.childDict.combative;
                const races = combative.stateDict.races;
                return requiredRaces.some(race => races.includes(race));
            });
        }
        return result;
    }
}