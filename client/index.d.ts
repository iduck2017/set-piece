import { Game } from "./model/game";
import { Service } from "./model/service";

declare global {
    interface Window { 
        game: Game;
        service: Service
    }
}