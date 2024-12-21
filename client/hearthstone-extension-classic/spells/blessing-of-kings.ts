import { CustomDef, Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { SpellDef } from "@/hearthstone/models/spell";
import { SpellModel } from "@/hearthstone/models/spell";
import { TargetCollector } from "@/hearthstone/types/collector";
import { MinionModel } from "@/hearthstone/models/minion";
import { BlessingOfKingsBuffModel } from "../buffs/blessing-of-kings";
import { ClassNameType, ExpansionType, RarityType } from "@/hearthstone/services/database";

export type SpellBlessingOfKingsDef = SpellDef<{
    code: 'blessing-of-kings-spell-card',
}>

@SpellModel.useRule({
    castable: {
        manaCost: 4
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Paladin
    }
})
@FactoryService.useProduct('blessing-of-kings-spell-card')
export class BlessingOfKingsModel extends SpellModel<SpellBlessingOfKingsDef> {
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
            BlessingOfKingsBuffModel
        >('blessing-of-kings-buff-feature');
    }

    handleCollectorInit(targetCollectorList: TargetCollector[]) {
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