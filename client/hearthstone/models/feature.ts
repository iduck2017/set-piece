import { CardModel } from "./card/card";
import { Def, Factory, Model, NodeModel, Props } from "@/set-piece";
import { MinionModel } from "./card/minion";

export type FeatureListDef = Def.Create<{
    code: 'feature-list',
    stateDict: {},
    paramDict: {},
    childList: FeatureModel[],
    eventDict: {},
    parent: CardModel<Def.Pure>
}>

export type FeatureDef = Def.Create<{
    code: string,
    stateDict: {
    },
    paramDict: {
        readonly name: string;
        readonly desc: string;
    }
    childList: [],
    eventDict: {},
    parent: CardModel<Def.Pure> | FeatureListModel
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
    
    addFeature<M extends FeatureModel>(chunk: Model.Chunk<M>) {
        console.log('[add-feature]', chunk);
        const target = this.appendChild(chunk);
        return target;
    }
}

export abstract class FeatureModel<
    T extends Def = Def
> extends NodeModel<T & FeatureDef> {
    static featureProps<T>(props: Props<T & FeatureDef>) {
        return props;
    }

    get card(): CardModel<Def.Pure> {
        return this.parent instanceof CardModel ? 
            this.parent : 
            this.parent.parent;
    }

    get minion(): MinionModel<Def.Pure> | undefined {
        return this.card instanceof MinionModel ? this.card : undefined;
    }

    // get stateDict() {
    //     return {
    //         ...super.stateDict,
    //         card: this.card
    //     };
    // }
}