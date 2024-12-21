import { CustomDef, FactoryService, Props } from "@/set-piece";
import { BattlecryModel } from "@/hearthstone/models/battlecry";
import { FeatureDef } from "@/hearthstone/models/feature";
import { TargetCollector } from "@/hearthstone/types/collector";
import { CardModel } from "@/hearthstone/models/card";

export type BattlecryFlameImpDef = FeatureDef<{
    code: 'flame-imp-battlecry-feature',
}>

@FactoryService.useProduct('flame-imp-battlecry-feature')
export class FlameImpBattlecryModel extends BattlecryModel<BattlecryFlameImpDef> {
    constructor(props: Props<BattlecryFlameImpDef>) {
        super({
            ...props,
            paramDict: {
                name: "Flame Imp's Battlecry",
                desc: "Deal 3 damage to your hero."
            },
            stateDict: {},
            childDict: {}
        });
    }

    protected battlecry(
        target: CardModel,
        targetCollectorList: TargetCollector[]
    ): void {
        const player = this.referDict.player;
        if (!player) return;

        const combative = player.childDict.combative;
        combative.receiveDamage(3, this.referDict.card);
    }

    protected handleCollectorInit(
        targetCollectorList: TargetCollector[]
    ) {
        // No target selection needed
        return;
    }
} 