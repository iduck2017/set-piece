import { CustomDef, Def, Factory, Lifecycle, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { NoviceEngineerModel } from "../minions/novice-engineer";

export type BattlecryNoviceEngineerDef = FeatureDef<
    CustomDef<{
        code: 'battlecry-novice-engineer',
        parent: NoviceEngineerModel
    }>
>

@Factory.useProduct('battlecry-novice-engineer')
export class BattlecryNoviceEngineerModel extends FeatureModel<BattlecryNoviceEngineerDef> {
    constructor(props: Props<BattlecryNoviceEngineerDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Novice Engineer\'s Battlecry',
                desc: 'Draw a card.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    @Lifecycle.useLoader()
    private _handleBattlecry() {
        const deck = this.refer.playerDeck;
        const minion = this.refer.minion;
        if (!deck || !minion) return;

        this.bindEvent(
            minion.eventEmitterDict.onBattlecry,
            () => {
                deck.drawCard();
            }
        );
    }
} 