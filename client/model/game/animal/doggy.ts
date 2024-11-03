import { IModel } from "@/model";
import { IAnimal } from ".";
import { RawModelDefine } from "@/type/define";

export type DoggyDefine = 
    RawModelDefine<{
        type: 'doggy',
        stateMap: {
        },
        referMap: {}
    }>

@IModel.useProduct('doggy')
export class Doggy extends IAnimal<
    DoggyDefine
> {
    constructor(
        config: Doggy['config'],
        parent: DoggyDefine['parent']
    ) {
        super({
            ...config,
            childMap: {},
            stateMap: {
                ...config.stateMap
            },
            referMap: {}
        }, parent);
    }
}