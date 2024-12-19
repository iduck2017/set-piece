import { CustomDef, Def, Factory, Lifecycle, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { ElvenArcherModel } from "../minions/elven-archer";
import { TargetCollector } from "../card";
import { MinionModel } from "../minion";
import { validateTarget } from "@/hearthstone/utils/validator";

export type BattlecryElvenArcherDef = FeatureDef<
    CustomDef<{
        code: 'battlecry-elven-archer',
        parent: ElvenArcherModel
    }>
>

@Factory.useProduct('battlecry-elven-archer')
export class BattlecryElvenArcherModel extends FeatureModel<BattlecryElvenArcherDef> {
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

    @Lifecycle.useLoader()
    private _handleBattlecry() {
        const minion = this.refer.minion;
        const combatable = this.refer.minionCombatable;
        if (!minion || !combatable) return;

        this.bindEvent(
            minion.eventEmitterDict.onBattlecry,
            (target, targetCollectorList) => {
                const targetCollector:
                    TargetCollector<MinionModel> | undefined =
                    targetCollectorList.find(
                        item => item.uuid === this.uuid
                    );
                if (targetCollector?.result) {
                    const combatable = targetCollector.result.childDict.combatable;
                    combatable.receiveDamage(1, combatable);
                }
            }
        );
    }

    @Lifecycle.useLoader()
    private _handleTargetCheck() {
        const card = this.refer.card;
        if (!card) return;

        this.bindEvent(
            card.eventEmitterDict.onTargetCheck,
            (targetCollectorList: TargetCollector[]) => {
                const minionList = this.refer.queryMinionList({});
                if (minionList.length) {
                    targetCollectorList.push({
                        uuid: this.uuid,
                        hint: 'Choose a target',
                        validator: (model) => validateTarget(
                            model,
                            { isMinionOnBoard: true }
                        )
                    });
                }
            }
        );
    }
} 