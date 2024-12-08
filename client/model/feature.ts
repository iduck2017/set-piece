import { DictModel } from "./dict";
import { NodeProps } from "@/type/props";

type FeatureDef = {
    code: 'feature',
    state: {},
    child: {},
    event: {}
}

export class FeatureModel extends DictModel<FeatureDef> {
    constructor(props: NodeProps<FeatureDef>) {
        super({
            ...props,
            state: {},
            child: {}
        });
    }
}