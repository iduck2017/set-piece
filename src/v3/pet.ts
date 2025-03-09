import { Model } from "./model";
import { BaseHumanModel } from "./human";
import { BaseOuterPartyModel } from "./outer-party";

export class PetModel extends Model<
    'pet',
    { onPlay: BaseHumanModel },
    { nickname: string },
    { isAlive: boolean }
> {
    
}