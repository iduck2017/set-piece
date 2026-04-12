import { LogLevel } from "./log-service";
import { useConsoleLog } from "./use-console-log";

class Game {
    public player = new Player();
    @useConsoleLog(LogLevel.INFO)
    public start() {
        this.player.perform();
    }
}

class Player {
    public cards: Card[] = [new Card()]
    @useConsoleLog(LogLevel.WARN)
    public perform() {
        this.cards.forEach((card) => card.play());
    }
}

class Card {
    @useConsoleLog(LogLevel.INFO)
    public play() {
        console.log('Card played')
    }
}

const game = new Game();
game.start()