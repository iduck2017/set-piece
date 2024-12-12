import { Factory } from "@/service/factory";
import { Random } from "@/util/random";
import { AnimalModel } from "./animal";
import { Validator } from "@/service/validator";
import { NodeModel } from "./node";
import { Def } from "@/type/define";
import { Props } from "@/type/props";
import { Model } from "@/type/model";

export enum Gender {
    Male = 'male',
    Female = 'female',
    Unknown = 'unknown'
}

type ReproductiveDef<T extends AnimalModel> = Def.Merge<{
    code: 'reproductive',
    stateDict: {
        gender: Gender
    },
    childList: T[],
    parent: AnimalModel
}>

@Factory.useProduct('reproductive')
export class ReproductiveModel<
    T extends AnimalModel
> extends NodeModel<ReproductiveDef<T>> {
    constructor(props: Props<ReproductiveDef<T>>) {
        super({
            ...props,
            stateDict: {
                gender: Random.type(Gender),
                ...props.stateDict
            },
            childDict: {},
            paramDict: {}
        });
    }

    @Validator.useCondition(model => model.parent.stateDict.isAlive)
    @Validator.useCondition(model => model.stateDict.gender === Gender.Female)
    reproduceChild(chunk: Model.Chunk<T>): void {
        this._childChunkList.push(chunk);
    }
    
}