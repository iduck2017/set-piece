import { IModel } from "../..";
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
> extends IModel<
    D & AnimalDefine
> {
    protected static isAlive() {
        return IModel.useValidator<IAnimal>(
            model => model._rawStateMap.isAlive,
            true
        );
    }

    constructor(
        config: IModel.Config<D> & IModel.RawConfig<AnimalDefine>,
        parent: IModel
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
    
    @IModel.useDebugger()
    @IAnimal.isAlive()
    @Game.useTime()
    growup() {
        this._rawStateMap.curAge += 1;
    }
}

