import { AnimalModel } from "./animal";
import { Def, Props, Model, NodeModel, ValidatorService, FactoryService, Random, CustomDef } from "@/set-piece";

export enum GenderType {
    Male = 'male',
    Female = 'female',
    Unknown = 'unknown'
}

type ReproductiveDef<T extends AnimalModel> = CustomDef<{
    code: 'reproductive',
    stateDict: {
        gender: GenderType
    },
    childList: T[],
    parent: AnimalModel
}>

@FactoryService.useProduct('reproductive')
export class ReproductiveModel<
    T extends AnimalModel
> extends NodeModel<ReproductiveDef<T>> {
    constructor(props: Props<ReproductiveDef<T>>) {
        super({
            ...props,
            stateDict: {
                gender: Random.type(GenderType),
                ...props.stateDict
            },
            childDict: {},
            paramDict: {}
        });
    }

    @ValidatorService.useCondition(model => model.parent.stateDict.isAlive)
    @ValidatorService.useCondition(model => model.stateDict.gender === GenderType.Female)
    reproduceChild(chunk: Model.Chunk<T>): void {
        this.childChunkList.push(chunk);
    }
}