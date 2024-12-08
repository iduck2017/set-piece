import { NodeDef } from "@/type/define";
import { DictModel } from "./dict";
import { MetabolicModel } from "./metabolic";
import { BaseDictProps } from "@/type/props";

export type AnimalDef = {
    code: string;
    state: {
        isAlive: boolean;
    },
    event: {},
    child: {
        metabolic: MetabolicModel
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
                metabolic: { code: 'metabolic' },
                ...props.child
            }
        });
    }
}