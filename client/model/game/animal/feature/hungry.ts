import { IModel } from "@/model";
import { RawModelDefine } from "@/type/define";
import { IFeature } from ".";
import { IAnimal } from "..";

export type HungryDefine = 
    RawModelDefine<{
        type: 'hungry',
        stateMap: {

        },
        referMap: {},
        parent: IAnimal,
    }>

@IModel.useProduct('hungry')
export class Hungry extends IFeature<
    HungryDefine
> {
    constructor(
        config: Hungry['config'],
        parent: HungryDefine['parent']
    ) {
        super({
            ...config,
            childMap: {},
            stateMap: {
                name: 'hungry',
                desc: 'It is hungry',
                ...config.stateMap
            },
            referMap: {}
        }, parent);
    }
}