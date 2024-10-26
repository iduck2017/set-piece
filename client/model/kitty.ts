import { Model } from ".";
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

@Model.$useProduct('kitty')
export class KittyModel extends IAnimalModel<
    'kitty',
    KittyState
> {
    declare parent: RootModel;

    constructor(
        config: KittyModel['config'],
        parent: RootModel
    ) {
        super({
            ...config,
            child: {
                ...config.child,
                dict: config.child?.dict || {}
            },
            state: {
                curAge: 0,
                maxAge: 100,
                gender: Random.type(
                    Gender.Femail,
                    Gender.Male,
                    Gender.Unknown
                ),
                name: 'Kitty',
                ...config.state
            }
        }, parent);
    }
}