import { Model } from ".";
import { Base } from "../type";
import { BunnyModel } from "./bunny";
import { KittyModel } from "./kitty";
import type { RootModel } from "./root";

export type AnimalModel = 
    BunnyModel |
    KittyModel

export type AnimalState = {
    curAge: number;
    maxAge: number;
}

export abstract class IAnimalModel<
    I extends string = any,
    S extends Base.Data = {},
    D extends Record<string, Model> = any,
    L extends Model = any,
    E extends Base.Dict = any
> extends Model<
    I,
    AnimalState & S,
    D,
    L,
    E
> {
    declare parent: RootModel;
    
    @Model.useDebug()
    growup() {
        this.$state.curAge += 1;
    }
}