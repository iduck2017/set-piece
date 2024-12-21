import { CustomDef, Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { SpellDef } from "@/hearthstone/models/spell";
import { SpellModel } from "@/hearthstone/models/spell";
import { TargetCollector } from "@/hearthstone/types/collector";
import { MinionModel } from "@/hearthstone/models/minion";
import { PlayerModel } from "@/hearthstone/models/player";
import { ClassNameType, ExpansionType, RarityType } from "@/hearthstone/services/database";

export type SpellMoonfireDef = SpellDef<{
    code: 'moonfire-spell-card',
}>

@SpellModel.useRule({
    castable: {
        manaCost: 0
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Druid
    }
})
@FactoryService.useProduct('moonfire-spell-card')
export class MoonfireModel extends SpellModel<SpellMoonfireDef> {
    constructor(props: Props<SpellMoonfireDef>) {
        const superProps = SpellModel.spellProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Moonfire',
                desc: 'Deal 1 damage.',
                flavor: '"Cast Moonfire, and never stop." - How to Be a Druid, Chapter 5, Section 3'
            },
            stateDict: {}
        });
    }

    protected cast(
        targetCollectorList: TargetCollector<MinionModel | PlayerModel>[]
    ) {
        const target = targetCollectorList[0]?.result;
        if (!target) return;
        const combative = target.childDict.combative;
        combative.receiveDamage(1, this);
    }

    protected handleCollectorCheck(targetCollectorList: TargetCollector[]) {
        const game = this.referDict.game;
        if (!game) return;
        const candidateList = game.queryMinionAndPlayerList({});
        if (!candidateList.length) return;
        targetCollectorList.push({
            uuid: this.uuid,
            hint: 'Choose a target.',
            candidateList,
        });
    }
} 