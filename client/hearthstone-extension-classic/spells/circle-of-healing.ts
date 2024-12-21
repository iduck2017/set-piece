import { CustomDef, Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { SpellDef } from "@/hearthstone/models/spell";
import { SpellModel } from "@/hearthstone/models/spell";
import { TargetCollector } from "@/hearthstone/types/collector";

export type SpellCircleOfHealingDef = SpellDef<
    CustomDef<{
        code: 'circle-of-healing-spell-card',
    }>
>

@SpellModel.useRule({
    castable: {
        manaCost: 0
    }
})
@FactoryService.useProduct('circle-of-healing-spell-card')
export class CircleOfHealingModel extends SpellModel<SpellCircleOfHealingDef> {
    constructor(props: Props<SpellCircleOfHealingDef>) {
        const superProps = SpellModel.spellProps(props);
        super({
            ...superProps,
            paramDict: {
                name: "Circle of Healing",
                desc: "Restore 4 Health to ALL minions.",
                flavor: "It isn't really a circle."
            },
            stateDict: {}
        });
    }

    protected cast() {
        const game = this.referDict.game;
        if (!game) return;
        // Get all minions on board
        const targetList = game.queryMinionAndPlayerList({
            excludePlayer: true
        });
        // Heal each minion for 4
        targetList.forEach(minion => {
            const combative = minion.childDict.combative;
            combative.restoreHealth(4, this);
        });
    }

    protected handleCollectorCheck(targetCollectorList: TargetCollector[]) {
        // No target selection needed
        return;
    }
} 