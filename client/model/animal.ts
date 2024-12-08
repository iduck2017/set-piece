import { NodeDef } from "@/type/define";
import { DictModel } from "./dict";
import { FeatureModel } from "./feature";
import { BaseDictProps } from "@/type/props";

export type AnimalDef = {
    code: never;
    state: {
        isAlive: boolean;
    },
    event: {},
    child: {
        feature: FeatureModel
    }
}

export abstract class AnimalModel<
    T extends Partial<NodeDef> = NodeDef
> extends DictModel<T & AnimalDef> {
    constructor(props: BaseDictProps<T, AnimalDef>) {
        super({
            ...props,
            state: {
                isAlive: true,
                ...props.state
            },
            child: {
                feature: { code: 'feature' },
                ...props.child
            }
        });
    }
}