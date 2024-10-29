import { Model } from ".";
import { Global } from "../utils/global";
import { Random } from "../utils/random";
import { IAnimalModel } from "./animal";
import { RootModel } from "./root";

export enum Gender {
    Male = 'male',
    Femail = 'female',
    Unknown = 'unknown'
}

export type KittyState = {
    name: string;
    gender: Gender;
}

@Model._useProduct('kitty')
@Global.useSingleton
export class KittyModel extends IAnimalModel<
    'kitty',
    KittyState
> {
    declare parent: RootModel;

    constructor(
        config: KittyModel['config'],
        parent: RootModel
    ) {
        console.log('KittyModel constructor');
        super({
            ...config,
            childMap: {},
            stateMap: {
                curAge: 0,
                maxAge: 100,
                isAlive: true,
                gender: Random.type(
                    Gender.Femail,
                    Gender.Male,
                    Gender.Unknown
                ),
                name: 'Kitty',
                ...config.stateMap
            }
        }, parent);
    }
}