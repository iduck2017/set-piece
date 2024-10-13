import { CastratedModel } from '../models/castrated';
import { FeaturesModel } from '../models/features';
import { DeckModel } from '../models/deck';

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

export const MODEL_REGISTRY = {
    // @model-registry
    [ModelCode.Castrated]: CastratedModel,
    [ModelCode.Features]: FeaturesModel,
    [ModelCode.Deck]: DeckModel,
    [ModelCode.Root]: RootModel,
    [ModelCode.Timer]: TimerModel,
    [ModelCode.Bunny]: BunnyModel,
    [ModelCode.Card]: CardModel,
    [ModelCode.Player]: PlayerModel,
    [ModelCode.Game]: GameModel
}; 

export type ModelRegstry = Validate<typeof MODEL_REGISTRY, { 
    [K in ModelCode]: new (config: any) => Model<ModelDef & { code: K }>
}>
