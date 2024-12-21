import { CustomDef, FactoryService, Props } from "@/set-piece";
import { Random } from "@/set-piece";
import { BloodImpBuffModel } from "../buffs/blood-imp";
import { MinionModel } from "@/hearthstone/models/minion";
import { TurnEndDef, TurnEndModel } from "@/hearthstone/models/turn-end";

export type FeatureBloodImpDef = TurnEndDef<{
    code: 'blood-imp-turn-end-feature',
}>

@FactoryService.useProduct('blood-imp-turn-end-feature')
export class BloodImpFeatureModel extends TurnEndModel<FeatureBloodImpDef> {
    constructor(props: Props<FeatureBloodImpDef>) {
        const superProps = TurnEndModel.turnEndProps(props);
        super({
            ...superProps,
            paramDict: {
                name: "Blood Imp's Effect",
                desc: "At the end of your turn, give another random friendly minion +1 Health."
            },
            stateDict: {},
            childDict: {}
        });
    }

    protected handleTurnEnd(): void {
        const game = this.referDict.game;
        if (!game) return;

        // Get friendly minions excluding self
        const candidateList = game.queryTargetList({
            excludePlayer: true,
            excludeTarget: this.referDict.card,
            excludePosition: game.getOpponent(this.referDict.player)
        });
        if (!candidateList.length) return;

        // Choose random friendly minion
        const index = Random.number(0, candidateList.length - 1);
        const target = candidateList[index];
        console.log('[blood-imp-turn-end-feature-target]', target);

        // Apply health buff
        target.childDict.featureList.accessFeature<
            BloodImpBuffModel
        >('blood-imp-buff-feature');
    }
} 