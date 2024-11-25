import { Def } from "@/type/define";
import { Model } from ".";
import { Base } from "@/type/base";

export abstract class Feat<M extends Partial<Def>> extends Model<{
    tempState: {
        readonly name: string;
        readonly desc: string
    }
} & M> {}


@Model.useProduct('edible')
export class Edible extends Feat<{
    type: 'edible';
    memoState: {
    },
    tempState: {
    },
}> {
    constructor(
        seq: Model.Seq<Edible>,
        parent: Model.Parent<Edible>
    ) {
        super({
            ...seq,
            childDict: {},
            childList: {},
            memoState: {
                ...seq.memoState
            },
            tempState: {
                name: 'Edible',
                desc: ''
            }
        }, parent);
    }

    kill() {
        console.log('eat');
    }
}

type PetableInfo = {
    readonly rawObedience: number;
    readonly rawIntelligence: number;
}
@Model.useProduct('petable')
export class Petable extends Feat<{
    type: 'petable';
    memoState: {
    },                
    tempState: PetableInfo,
}> {
    private static readonly _rule: Map<Function, PetableInfo> = new Map();
    static useRule(info: PetableInfo) {
        return function (target: Base.Class<Model>) {
            Petable._rule.set(target, info);
        };
    }

    constructor(
        seq: Model.Seq<Petable>,
        parent: Model.Parent<Petable>
    ) {
        const rule = Petable._rule.get(parent.constructor);
        super({
            ...seq,
            childDict: {},
            childList: {},
            memoState: {
                ...seq.memoState
            },
            tempState: {
                rawObedience: rule?.rawObedience || 50,
                rawIntelligence: rule?.rawIntelligence || 50,
                name: 'Petable',
                desc: ''
            }
        }, parent);
    }

    play() {
        console.log('play');
    }
}

