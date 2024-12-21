import { CustomDef, Props } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { SpellDef } from "@/hearthstone/models/spell";
import { SpellModel } from "@/hearthstone/models/spell";
import { TargetCollector } from "@/hearthstone/types/collector";
import { MinionModel } from "@/hearthstone/models/minion";
import { PlayerModel } from "@/hearthstone/models/player";
import { ExpansionType, RarityType } from "@/hearthstone/services/database";
import { ClassNameType } from "@/hearthstone/services/database";

export type SpellArcaneShotDef = SpellDef<{
    code: 'arcane-shot-spell-card',
}>

@SpellModel.useRule({
    castable: {
        manaCost: 1
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Hunter
    }
})
@FactoryService.useProduct('arcane-shot-spell-card')
export class ArcaneShotModel extends SpellModel<SpellArcaneShotDef> {
    constructor(props: Props<SpellArcaneShotDef>) {
        const superProps = SpellModel.spellProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Arcane Shot',
                desc: 'Deal 2 damage.',
                flavor: 'Magi conjured arcane arrows to sell to hunters, until hunters learned just enough magic to do it themselves. The resulting loss of jobs sent Stormwind into a minor recession.'
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
        combative.receiveDamage(2, this);
    }

    protected handleCollectorInit(targetCollectorList: TargetCollector[]) {
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