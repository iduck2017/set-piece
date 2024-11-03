import { Model } from "../..";
import { Bunny } from "./bunny";
import { Kitty } from "./kitty";
import { Game } from "..";
import { ModelDefine, RawModelDefine } from "../../../type/define";

export enum AnimalGender {
    Male = 'male',
    Femail = 'female',
    Unknown = 'unknown'
}

export type AnimalDefine = 
    RawModelDefine<{
        type: string;
        stateMap: {
            curAge: number;
            maxAge: number;
            isAlive: boolean;
        },
        referMap: {}
    }>

export type Animal = 
    Bunny |
    Kitty

export abstract class IAnimal<
    D extends ModelDefine = ModelDefine
> extends Model<
    D & AnimalDefine
> {
    protected static isAlive() {
        return Model.useValidator<IAnimal>(
            model => model._rawStateMap.isAlive,
            true
        );
    }

    constructor(
        config: Model.Config<D> & Model.RawConfig<AnimalDefine>,
        parent: Model
    ) {
        super({
            ...config,
            stateMap: {
                curAge: 0,
                maxAge: 100,
                isAlive: true,
                ...config.stateMap
            }
        }, parent);
    }


    declare parent: Game;
    
    @Model.useDebugger()
    @IAnimal.isAlive()
    @Game.useTime()
    growup() {
        this._rawStateMap.curAge += 1;
    }
}

