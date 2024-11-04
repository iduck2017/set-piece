import { IModel } from "../..";
import { Bunny } from "./bunny";
import { Kitty } from "./kitty";
import { Game } from "..";
import { ModelDefine, RawModelDefine } from "../../../type/define";
import { Features } from "./feature/features";


export enum AnimalGender {
    Male = 'male',
    Femail = 'female',
    Unknown = 'unknown'
}

export type Animal = 
    Bunny |
    Kitty

export type IAnimalDefine = 
    RawModelDefine<{
        type: string;
        stateMap: {
            curAge: number;
            maxAge: number;
            isAlive: boolean;
        },
        childMap: {
            features?: Features;
        }
        referMap: {}
    }>


export abstract class IAnimal<
    D extends ModelDefine = ModelDefine
> extends IModel<
    D & IAnimalDefine
> {
    protected static isAlive() {
        return IModel.useValidator<IAnimal>(
            model => model._rawStateMap.isAlive,
            true
        );
    }


    declare parent: Game;
    
    @IModel.useDebugger()
    @IAnimal.isAlive()
    @Game.useTime()
    growup() {
        this._rawStateMap.curAge += 1;
    }
}

