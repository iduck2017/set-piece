import { CustomDef, Def, Factory, Lifecycle, Props, Random } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { BloodImpModel } from "../minions/blood-imp";
import { BuffBloodImpModel } from "../effects/buff-blood-imp";

export type FeatureBloodImpDef = FeatureDef<
    CustomDef<{
        code: 'feature-blood-imp',
        parent: BloodImpModel
    }>
>

@Factory.useProduct('feature-blood-imp')
export class FeatureBloodImpModel extends FeatureModel<FeatureBloodImpDef> {
    constructor(props: Props<FeatureBloodImpDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Blood Imp\'s Effect',
                desc: 'Give another random friendly minion +1 Health.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    @Lifecycle.useLoader()
    private _handleEndTurn() {
        const game = this.refer.game;
        const minion = this.refer.minion;
        if (!minion || !game) return;

        this.bindEvent(
            game.eventEmitterDict.onRoundEnd,
            () => {
                const minionList = this.refer.queryMinionList({
                    excludeTarget: minion
                });
                const index = Random.number(0, minionList.length - 1);
                const target = minionList[index];
                target.childDict.featureList.accessFeature<
                    BuffBloodImpModel
                >({ code: 'buff-blood-imp' });
            }
        );
    }
} 