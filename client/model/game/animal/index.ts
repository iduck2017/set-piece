import { Model } from "../..";
import { Base } from "../../../type/base";
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
        stateMap: {
            curAge: number;
            maxAge: number;
            isAlive: boolean;
        },
    }>

export type Animal = 
    Bunny |
    Kitty

export abstract class IAnimal<
    D extends ModelDefine = RawModelDefine<{
        type: string
    }>
> extends Model<
    D & AnimalDefine
> {
    protected static isAlive() {
        return function (
            target: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            const handler = descriptor.value;
            descriptor.value = function(
                this: IAnimal, 
                ...args
            ) {
                if (this.curStateMap.isAlive) {
                    return handler?.apply(this, args);
                }
            };
            return descriptor;
        };
    }


    declare parent: Game;
    
    @Game.useTime()
    @Model.useDebug()
    growup() {
        this._rawStateMap.curAge += 1;
    }
}

