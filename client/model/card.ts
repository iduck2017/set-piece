import { Def } from "@/type/define";
import { NodeModel } from "./node";
import { Props } from "@/type/props";
import { CastableModel } from "./castable";
import { FeatureListModel } from "./feature";

export type CardDef = Def.Merge<{
    code: string;
    stateDict: {
    },
    paramDict: {
        readonly name: string;
        readonly desc: string;
    }
    eventDict: {},
    childDict: {
        castable?: CastableModel,
        featureList: FeatureListModel
    }
}>

export abstract class CardModel<
    T extends Def = Def
> extends NodeModel<T & CardDef> {
    static mergeProps(props: Props<CardDef>): Props.Strict<CardDef> {
        return {
            ...props,
            stateDict: {
            },
            paramDict: {
                name: 'Unknown Card',
                desc: 'Unknown Card'
            },
            childDict: {
                featureList: { code: 'feature-list' }
            }
        };
    }
}