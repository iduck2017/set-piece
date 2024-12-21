import { CustomDef, Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { SpellDef } from "@/hearthstone/models/spell";
import { SpellModel } from "@/hearthstone/models/spell";
import { TargetCollector } from "@/hearthstone/types/collector";
import { MinionModel } from "@/hearthstone/models/minion";
import { DebuffHuntersMarkModel } from "../buffs/hunters-mark";

export type SpellHuntersMarkDef = SpellDef<
    CustomDef<{
        code: 'hunters-mark-spell-card',
    }>
>

@SpellModel.useRule({
    castable: {
        manaCost: 0
    }
})
@FactoryService.useProduct('hunters-mark-spell-card')
export class HuntersMarkModel extends SpellModel<SpellHuntersMarkDef> {
    constructor(props: Props<SpellHuntersMarkDef>) {
        const superProps = SpellModel.spellProps(props);
        super({
            ...superProps,
            paramDict: {
                name: "Hunter's Mark",
                desc: "Change a minion's Health to 1.",
                flavor: "Never play 'Hide and Go Seek' with a Hunter."
            },
            stateDict: {}
        });
    }

    protected cast(
        targetCollectorList: TargetCollector<MinionModel>[]
    ) {
        const target = targetCollectorList[0]?.result;
        if (!target) return;
        target.childDict.featureList.accessFeature<
            DebuffHuntersMarkModel
        >('hunters-mark-debuff-feature');
    }

    protected handleCollectorCheck(targetCollectorList: TargetCollector[]) {
        const game = this.referDict.game;
        if (!game) return;
        const candidateList = game.queryMinionAndPlayerList({
            excludePlayer: true
        });
        if (!candidateList.length) return;
        targetCollectorList.push({
            uuid: this.uuid,
            hint: 'Choose a minion.',
            candidateList,
        });
    }
}
