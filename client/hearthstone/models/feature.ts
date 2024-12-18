import { Def, Factory, Model, NodeModel, Props } from "@/set-piece";
import { FeatureRefer } from "../utils/refers/feature";

export type FeatureListDef = Def.Create<{
    code: 'feature-list',
    stateDict: {},
    paramDict: {},
    childList: FeatureModel[],
    eventDict: {
        onFeatureAccess: [FeatureModel];
    },
}>

export type FeatureDef<
    T extends Def = Def
> = Def.Create<{
    code: string,
    stateDict: {
    },
    paramDict: {
        readonly name: string;
        readonly desc: string;
    }
    childList: [],
    eventDict: {},
}> & T;

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
    
    accessFeature<M extends FeatureModel>(chunk: Model.Chunk<M>) {
        const target = this.appendChild(chunk);
        if (target) {
            this.eventDict.onFeatureAccess(target);
            return target;
        }
    }
}


export abstract class FeatureModel<
    T extends FeatureDef = FeatureDef
> extends NodeModel<T> {
    readonly refer: FeatureRefer;

    static featureProps<T extends FeatureDef>(
        props: Props<T>
    ) {
        return props;
    }
    
    constructor(props: Props.Strict<T>) {
        super(props);
        this.refer = new FeatureRefer(this);
    }
}