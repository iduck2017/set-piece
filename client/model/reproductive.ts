import { Factory } from "@/service/factory";
import { NodeProps } from "@/type/props";
import { Random } from "@/util/random";
import { AnimalModel } from "./animal";
import { ListModel } from "./list";
import { Model } from "./node";
import { Validator } from "@/service/validator";

export enum Gender {
    Male = 'male',
    Female = 'female',
    Unknown = 'unknown'
}

type ReproductiveDef<T extends AnimalModel> = {
    code: 'reproductive',
    state: {
        gender: Gender
    }
    child: T[],
    parent: AnimalModel
}

@Factory.useProduct('reproductive')
export class ReproductiveModel<
    T extends AnimalModel
> extends ListModel<ReproductiveDef<T>> {
    constructor(props: NodeProps<ReproductiveDef<T>>) {
        super({
            child: [],
            ...props,
            state: {
                gender: Random.type(Gender),
                ...props.state
            }
        });
    }

    @Validator.useCondition(model => model.parent.state.isAlive)
    @Validator.useCondition(model => model.state.gender === Gender.Female)
    reproduce(chunk: Model.Chunk<T>): void {
        this.rawChild.push(chunk);
    }
}