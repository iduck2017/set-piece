import { Def } from "@/type/define";
import { NodeModel } from "../node";
import { Props } from "@/type/props";
import { Base } from "@/type/base";
import { Factory } from "@/service/factory";
import { CardModel } from "../card";

export type CastableRule = {
    manaCost: number;
}

export type CastableDef = Def.Create<{
    code: 'castable';
    stateDict: {
        readonly fixManaCost?: number;
    },
    paramDict: {
        curManaCost: number;
    }
    eventDict: {},
    childDict: {}
    parent: CardModel
}>

@Factory.useProduct('castable')
export class CastableModel extends NodeModel<CastableDef> {
    private static readonly _ruleMap: Map<Function, CastableRule> = new Map(); 
    static useRule(rule: CastableRule) {
        return function(Type: Base.Class) {
            CastableModel._ruleMap.set(Type, rule);
        };
    }

    constructor(props: Props<CastableDef>) {
        const castableRule = CastableModel._ruleMap.get(props.parent.constructor);
        super({
            ...props,
            stateDict: {
                ...props.stateDict
            },
            paramDict: {
                curManaCost: props.stateDict?.fixManaCost || castableRule?.manaCost || 1
            },
            childDict: {}
        });
    }
}