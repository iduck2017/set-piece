import { CustomDef, FactoryService, Props } from "@/set-piece";
import { BattlecryDef, BattlecryModel } from "@/hearthstone/models/battlecry";
import { TargetCollector } from "@/hearthstone/types/collector";
import { CardModel } from "@/hearthstone/models/card";
import { MinionModel } from "@/hearthstone/models/minion";

export type BattlecryElvenArcherDef = BattlecryDef<{
    code: 'elven-archer-battlecry-feature'
}>

@FactoryService.useProduct('elven-archer-battlecry-feature')
export class ElvenArcherBattlecryModel extends BattlecryModel<BattlecryElvenArcherDef> {
    constructor(props: Props<BattlecryElvenArcherDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Elven Archer\'s Battlecry',
                desc: 'Deal 1 damage.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    protected battlecry(
        target: CardModel,
        targetCollectorList: TargetCollector[]
    ) {
        const minion = this.referDict.minion;
        if (!minion) return;
        const targetCollector:
            TargetCollector<MinionModel> | undefined = 
            targetCollectorList.find(
                item => item.uuid === this.uuid
            );
        const result = targetCollector?.result;
        if (!result) return;
        result.childDict.combative.receiveDamage(1, minion);
    }

    protected handleCollectorCheck(
        targetCollectorList: TargetCollector[]
    ) {
        const game = this.referDict.game;
        if (!game) return;
        const candidateList = game.queryMinionAndPlayerList({
            excludeTarget: this.referDict.card
        });
        if (!candidateList.length) return;
        targetCollectorList.push({
            uuid: this.uuid,
            hint: 'Choose a target',
            candidateList
        });
    }
} 