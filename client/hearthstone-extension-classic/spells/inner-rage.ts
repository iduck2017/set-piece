import { CustomDef, Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { SpellDef } from "@/hearthstone/models/spell";
import { SpellModel } from "@/hearthstone/models/spell";
import { TargetCollector } from "@/hearthstone/types/collector";
import { MinionModel } from "@/hearthstone/models/minion";
import { InnerRageBuffModel } from "../buffs/inner-rage";
import { ClassNameType, ExpansionType, RarityType } from "@/hearthstone/services/database";

export type SpellInnerRageDef = SpellDef<{
    code: 'inner-rage-spell-card',
}>

@SpellModel.useRule({
    castable: {
        manaCost: 0
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Warrior
    }
})
@FactoryService.useProduct('inner-rage-spell-card')
export class InnerRageModel extends SpellModel<SpellInnerRageDef> {
    constructor(props: Props<SpellInnerRageDef>) {
        const superProps = SpellModel.spellProps(props);
        super({
            ...superProps,
            paramDict: {
                name: "Inner Rage",
                desc: "Deal 1 damage to a minion and give it +2 Attack.",
                flavor: "They're only smiling on the outside."
            },
            stateDict: {}
        });
    }

    protected cast(
        targetCollectorList: TargetCollector<MinionModel>[]
    ) {
        const target = targetCollectorList[0]?.result;
        if (!target) return;

        // Deal 1 damage first
        const combative = target.childDict.combative;
        combative.receiveDamage(1, this);

        // Then apply the attack buff
        target.childDict.featureList.accessFeature<
            InnerRageBuffModel
        >('inner-rage-buff-feature');
    }

    protected handleCollectorInit(targetCollectorList: TargetCollector[]) {
        const game = this.referDict.game;
        if (!game) return;
        const candidateList = game.queryTargetList({
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