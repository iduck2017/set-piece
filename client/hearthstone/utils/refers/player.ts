import { NodeRefer } from "../../../set-piece/utils/refer";
import { PlayerModel } from "../../models/player";
import { GameModel } from "../../models/game";
import { MinionModel } from "../../models/minion";
import { RaceType } from "../../services/database";

export class PlayerRefer extends NodeRefer {
    get player() { return this.queryParent(PlayerModel); }

    get opponent() {
        const player = this.player;
        const game = this.game;
        if (!player || !game) return undefined;
        if (game.childDict.redPlayer === player) {
            return game.childDict.bluePlayer;
        } 
        return game.childDict.redPlayer;
    }

    get game() { return this.queryParent(GameModel); }

    get playerDeck() { return this.player?.childDict.deck; }
    get playerHand() { return this.player?.childDict.hand; }
    get playerGraveyard() { return this.player?.childDict.graveyard; }
    get playerBoard() { return this.player?.childDict.board; }

    get opponentBoard() {
        const opponent = this.opponent;
        if (!opponent) return undefined;
        return opponent.childDict.board;
    }

    queryMinionList(options: {
        excludeTarget?: MinionModel
        excludeEnemy?: boolean,
        excludeAlly?: boolean,
        requiredRaces?: RaceType[]
    }) {
        const {
            excludeTarget,
            excludeEnemy,
            excludeAlly,
            requiredRaces
        } = options;
        const { playerBoard: board, opponentBoard } = this;
        if (!board || !opponentBoard) return [];
        let result: MinionModel[] = [
            ...excludeAlly ? [] : board.childList,
            ...excludeEnemy ? [] : opponentBoard.childList
        ];
        if (excludeTarget) {
            result = result.filter(item => item !== excludeTarget);
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