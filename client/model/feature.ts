import { Factory } from "@/service/factory";
import { Def } from "@/type/define";
import { NodeModel } from "./node";
import { Props } from "@/type/props";

type FeatureListDef = Def.Merge<{
    code: 'feature-list',
    stateDict: {},
    paramDict: {},
    childList: FeatureModel[],
    eventDict: {},
}>

type FeatureDef = Def.Merge<{
    code: 'feature',
    stateDict: {
        readonly name: string;
    },
    paramDict: {},
    childList: [],
    eventDict: {},
}>

@Factory.useProduct('feature-list')
export class FeatureListModel extends NodeModel<FeatureListDef> {
    constructor(props: Props<FeatureListDef>) {
        super({
            childList: [],
            ...props,
            childDict: {},
            stateDict: {},
            paramDict: {}
        });
    }
}

export abstract class FeatureModel<
    T extends Def = Def
> extends NodeModel<T & FeatureDef> {
    static mergeProps(props: Props<FeatureDef>): Props.Strict<FeatureDef> {
        return {
            ...props,
            stateDict: {
                name: 'Unknown Feature',
                ...props.stateDict
            },
            paramDict: {},
            childDict: {
            }
        };
    }
}