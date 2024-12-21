import { CustomDef, Props, Random } from "@/set-piece";
import { FactoryService } from "@/set-piece/services/factory";
import { SpellDef } from "@/hearthstone/models/spell";
import { SpellModel } from "@/hearthstone/models/spell";
import { TargetCollector } from "@/hearthstone/types/collector";
import { CardModel } from "@/hearthstone/models/card";
import { MinionModel } from "@/hearthstone/models/minion";
import { PlayerModel } from "@/hearthstone/models/player";

export type SpellArcaneMissilesDef = SpellDef<
    CustomDef<{
        code: 'arcane-missiles-spell-card',
    }>
>

@SpellModel.useRule({
    castable: {
        manaCost: 1
    }
})
@FactoryService.useProduct('arcane-missiles-spell-card')
export class ArcaneMissilesModel extends SpellModel<SpellArcaneMissilesDef> {
    constructor(props: Props<SpellArcaneMissilesDef>) {
        const superProps = SpellModel.spellProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Arcane Missiles',
                desc: 'Deal 3 damage randomly split among all enemy characters.',
                flavor: 'You\'d think you\'d be able to control your missiles a little better since you\'re a powerful mage and all.'
            },
            stateDict: {}
        });
    }

    protected cast() {
        const game = this.referDict.game;
        if (!game) return;
        for (let i = 0; i < 3; i++) {
            const candidateList = game.queryMinionAndPlayerList({
                excludePosition: this.referDict.player,
            });
            if (!candidateList.length) return;
            // Fire 3 missiles
            const index = Random.number(0, candidateList.length - 1);
            const target = candidateList[index];
            console.log('[launch-missile]', target);
            const combative = target.childDict.combative;
            combative.receiveDamage(1, this)
        }
    }

    protected handleCollectorCheck(targetCollectorList: TargetCollector[]) {
        // Arcane Missiles doesn't need target selection
        return;
    }
} 