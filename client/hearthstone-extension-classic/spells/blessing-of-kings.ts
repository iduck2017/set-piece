import { CustomDef, Props } from "@/set-piece";
import { Factory } from "@/set-piece/services/factory";
import { SpellDef } from "@/hearthstone/models/spell";
import { SpellModel } from "@/hearthstone/models/spell";
import { TargetCollector } from "@/hearthstone/types/collector";
import { MinionModel } from "@/hearthstone/models/minion";
import { BuffBlessingOfKingsModel } from "../buffs/blessing-of-kings";

export type SpellBlessingOfKingsDef = SpellDef<
    CustomDef<{
        code: 'spell-blessing-of-kings',
    }>
>

@SpellModel.useRule({
    manaCost: 4
})
@Factory.useProduct('spell-blessing-of-kings')
export class SpellBlessingOfKingsModel extends SpellModel<SpellBlessingOfKingsDef> {
    constructor(props: Props<SpellBlessingOfKingsDef>) {
        const superProps = SpellModel.spellProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Blessing of Kings',
                desc: 'Give a minion +4/+4.',
                flavor: 'Given the number of kings who have been assassinated, are you sure you want their blessing?'
            },
            stateDict: {}
        });
    }

    cast(targetCollectorList: TargetCollector[]) {
        const target: MinionModel | undefined = targetCollectorList[0]?.result;
        if (!target) return;
        target.childDict.featureList.accessFeature<
            BuffBlessingOfKingsModel
        >('buff-blessing-of-kings');
    }

    handleCollectorCheck(targetCollectorList: TargetCollector[]) {
        const game = this.referDict.game;
        if (!game) return;
        const candidateList = game.queryTargetList({
            excludePlayer: true,
        });
        if (!candidateList.length) return;
        targetCollectorList.push({
            uuid: this.uuid,
            hint: 'Choose a minion.',
            candidateList,
        });
    }
}