import { Def, Factory, Lifecycle, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { FlameImpModel } from "../minions/flame-imp";

export type BattlecryFlameImpDef = FeatureDef<
    Def.Create<{
        code: 'battlecry-flame-imp',
        parent: FlameImpModel
    }>
>

@Factory.useProduct('battlecry-flame-imp')
export class BattlecryFlameImpModel extends FeatureModel<BattlecryFlameImpDef> {
    constructor(props: Props<BattlecryFlameImpDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Flame Imp\'s Battlecry',
                desc: 'Deal 3 damage to your hero.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    @Lifecycle.useLoader()
    private _handleBattlecry() {
        const minion = this.refer.minion;
        const hero = this.refer.playerCombatable;
        if (!minion || !hero) return;
        this.bindEvent(
            minion.eventEmitterDict.onBattlecry,
            () => {
                hero.receiveDamage(3, hero);
            }
        );
    }
} 