import { Factory } from "@/service/factory";
import { ChunkOf } from "@/type/model";
import { Feats, IFeat } from '.';
import { Lifecycle } from "@/service/lifecycle";
import { Class } from "utility-types";
import { Card, ICard } from "../card";

type FeatureRule = {
    rawCount: number;
}

@Factory.useProduct('battle-cry-draw-card')
export class BattlecryDrawCard extends IFeat<
    'battle-cry-draw-card',
    {
        readonly rawCount: number;
    },
    {},
    {},
    Feats<IFeat, ICard>
> {
    private static _rules: Map<Function, FeatureRule> = new Map();
    static useFeature(rule: FeatureRule) {
        return function (Type: Class<Card>) {
            BattlecryDrawCard._rules.set(Type, rule);
        };
    }

    constructor(
        chunk: ChunkOf<BattlecryDrawCard>,
        parent: ICard
    ) {
        const rule = IFeat.merge<FeatureRule>(
            BattlecryDrawCard._rules.get(
                parent.constructor
            ), 
            {
                rawCount: chunk.state?.rawCount
            },
            {
                rawCount: 1
            }
        );

        super({
            ...chunk,
            child: {},
            state: {
                ...chunk.state,
                name: 'Draw Card',
                desc: `Draw ${rule.rawCount} card`,
                rawCount: rule.rawCount
            }
        }, parent);
    }

    @Lifecycle.useLoader()
    private _onLoad() {
        const minion = this.card.child.minion;
        if (minion) {
            this.bind(
                minion.event.onBattlecry,
                () => {
                    const player = this.card.player;
                    player.draw(this.state.rawCount);
                }
            );
        }
    }
}
