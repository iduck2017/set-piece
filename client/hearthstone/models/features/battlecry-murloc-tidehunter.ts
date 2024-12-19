import { CustomDef, Def, Factory, Lifecycle, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { MurlocTidehunterModel } from "../minions/murloc-tidehunter";
import { MurlocScoutModel } from "../minions/murloc-scout";

export type BattlecryMurlocTidehunterDef = FeatureDef<
    CustomDef<{
        code: 'battlecry-murloc-tidehunter',
        parent: MurlocTidehunterModel
    }>
>

@Factory.useProduct('battlecry-murloc-tidehunter')
export class BattlecryMurlocTidehunterModel extends FeatureModel<BattlecryMurlocTidehunterDef> {
    constructor(props: Props<BattlecryMurlocTidehunterDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Murloc Tidehunter\'s Battlecry',
                desc: 'Summon a 1/1 Murloc Scout.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    @Lifecycle.useLoader()
    private _handleBattlecry() {
        const minion = this.refer.minion;
        const board = this.refer.playerBoard;
        if (!minion || !board) return;

        this.bindEvent(
            minion.eventEmitterDict.onBattlecry,
            () => {
                board.summonMinion<MurlocScoutModel>({
                    code: 'murloc-scout'
                });
            }
        );
    }
} 