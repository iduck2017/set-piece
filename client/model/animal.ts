import { Model } from ".";
import { Base } from "../utils/base";
import { BunnyModel } from "./bunny";
import { KittyModel } from "./kitty";
import { RootModel } from "./root";

export type AnimalModel = 
    BunnyModel |
    KittyModel

export type AnimalState = {
    curAge: number;
    maxAge: number;
    isAlive: boolean;
}

export abstract class IAnimalModel<
    I extends string = string,
    S extends Base.Data = Record<never, never>,
    E extends Base.Map = Base.Map,
    D extends Record<string, Model> = Record<never, never>,
    L extends Model = never,
> extends Model<
    I,
    AnimalState & S,
    E,
    D,
    L
> {
    protected static isAlive() {
        return function (
            target: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            const handler = descriptor.value;
            descriptor.value = function(
                this: IAnimalModel, 
                ...args
            ) {
                if (this.curStateMap.isAlive) {
                    return handler?.apply(this, args);
                }
            };
            return descriptor;
        };
    }


    declare parent: RootModel;
    
    @RootModel.useTime()
    @Model.useDebug()
    growup() {
        this._rawStateMap.curAge += 1;
    }
}

