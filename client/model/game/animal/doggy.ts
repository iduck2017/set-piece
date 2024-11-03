import { Model } from "@/model";
import { IAnimal } from ".";
import { RawModelDefine } from "@/type/define";

export type DoggyDefine = 
    RawModelDefine<{
        type: 'doggy',
        stateMap: {
            name: string;
        },
        referMap: {}
    }>

@Model.useProduct('doggy')
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
                name: 'Doggy',
                ...config.stateMap
            },
            referMap: {}
        }, parent);
    }
}