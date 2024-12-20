import { RaceType } from "../services/database";
import { AppModel } from "./app";
import { MinionModel } from "./minion";
import { PlayerModel } from "./player";
import { CustomDef, Factory, Model, NodeModel, Props } from "@/set-piece";

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
    parent: AppModel
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

    queryTargetList(
        options: {
            excludePlayer?: boolean,
            excludeTarget?: Model,
            excludePosition?: PlayerModel,
            requiredRaces?: RaceType[]
        }
    ): Model[] {
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
        let result: Model[] = [
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
                const combatable = item.childDict.combatable;
                const races = combatable.stateDict.races;
                return requiredRaces.some(race => races.includes(race));
            });
        }
        return result;
    }
}