import { IModel } from "../..";
import { Random } from "../../../util/random";
import { AnimalGender, IAnimal } from ".";
import { Game } from "..";
import { RawModelDefine } from "../../../type/define";
import { Features } from "./feature/features";

export type KittyDefine = 
    RawModelDefine<{
        type: 'kitty',
        stateMap: {
            name: string;
            gender: AnimalGender;
        },
        childMap: {
            features: Features
        }
        referMap: {}
    }>

@IModel.useProduct('kitty')
export class Kitty extends IAnimal<
    KittyDefine
> {
    declare parent: Game;

    constructor(
        config: Kitty['config'],
        parent: Game
    ) {
        super({
            ...config,
            childMap: {
                features: { type: 'features' },
                ...config.childMap
            },
            stateMap: {
                curAge: 0,
                maxAge: 100,
                isAlive: true,
                gender: Random.type(
                    AnimalGender.Femail,
                    AnimalGender.Male,
                    AnimalGender.Unknown
                ),
                name: 'Kitty',
                ...config.stateMap
            },
            referMap: {}
        }, parent);
    }
}