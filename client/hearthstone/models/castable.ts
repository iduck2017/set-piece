import { Base, CustomDef, Def, Factory, Model, NodeModel, Props } from "@/set-piece";

export type CastableRule = {
    manaCost: number;
}

export type CastableDef = CustomDef<{
    code: 'castable';
    stateDict: {
        readonly fixManaCost?: number;
    },
    paramDict: {
        curManaCost: number;
    }
    eventDict: {},
    childDict: {}
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
        let rule: CastableRule | undefined = undefined;
        let target: Model | undefined = props.parent;
        while (target) {
            const tempRule = CastableModel._ruleMap.get(target.constructor);
            if (tempRule) rule = Object.assign(rule || {}, tempRule);
            target = target.parent;
        }
        const { manaCost } = rule || {};
        super({
            ...props,
            stateDict: {
                ...props.stateDict
            },
            paramDict: {
                curManaCost: props.stateDict?.fixManaCost || manaCost || 1
            },
            childDict: {}
        });
    }
}