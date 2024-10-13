import { Validate } from ".";
import { Model } from "../models";
import { BunnyModel } from "../models/bunny";
import { CardModel } from "../models/card";
import { GameModel } from "../models/game";
import { PlayerModel } from "../models/player";
import { RootModel } from "../models/root";
import { TimerModel } from "../models/timer";
import { ModelCode } from "./model-code";
import { ModelDef } from "./model-def";

export const MODEL_REG = {
    root: RootModel,
    timer: TimerModel,
    bunny: BunnyModel,
    card: CardModel,
    player: PlayerModel,
    game: GameModel
}; 

export type ModelReg = Validate<typeof MODEL_REG, { 
    [K in ModelCode]: new (config: any) => Model<ModelDef & { code: K }>
}>
