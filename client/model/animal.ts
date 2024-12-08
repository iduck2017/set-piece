import { DictDef } from "@/type/define";
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
    T extends Partial<DictDef> = DictDef
> extends DictModel<T & AnimalDef> {
    constructor(
        chunk: BaseDictProps<T, AnimalDef>
    ) {
        super({
            ...chunk,
            state: {
                isAlive: true,
                ...chunk.state
            },
            child: {
                feature: { code: 'feature' },
                ...chunk.child
            }
        });
    }
}