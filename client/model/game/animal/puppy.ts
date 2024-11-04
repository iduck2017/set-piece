import { IModel } from "@/model";
import { IAnimal } from ".";
import { RawModelDefine } from "@/type/define";

export type PuppyDefine = 
    RawModelDefine<{
        type: 'puppy',
        stateMap: {},
        referMap: {},
        childMap: {}
    }>

@IModel.useProduct('puppy')
export class Puppy extends IAnimal<
    PuppyDefine
> {
    constructor(
        config: Puppy['config'],
        parent: PuppyDefine['parent']
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
                ...config.stateMap
            },
            referMap: {}
        }, parent);
    }
}