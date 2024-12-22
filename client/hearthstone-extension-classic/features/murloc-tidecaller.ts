import { FactoryService, LifecycleService, Props, ValidatorService } from "@/set-piece";
import { FeatureDef, FeatureModel } from "@/hearthstone/models/feature";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { RaceType } from "@/hearthstone/services/database";
import { MurlocTidecallerBuffModel } from "../buffs/murloc-tidecaller";
import { ModuleFilenameHelpers } from "webpack";

export type FeatureMurlocTidecallerDef = FeatureDef<{
    code: 'murloc-tidecaller-feature',
}>

@FactoryService.useProduct('murloc-tidecaller-feature')
export class MurlocTidecallerFeatureModel extends FeatureModel<FeatureMurlocTidecallerDef> {
    constructor(props: Props<FeatureMurlocTidecallerDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Murloc Tidecaller\'s Effect',
                desc: 'Whenever a Murloc is summoned, gain +1 Attack.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenMinionSummon() {
        const game = this.referDict.game;
        if (!game) return;
        this.bindEvent(
            game.eventEmitterDict.onMinionSummon,
            (target: MinionModel) => {
                const combative = target.childDict.combative;
                if (!combative.stateDict.races.includes(RaceType.Murloc)) return;
                if (target.referDict.player !== this.referDict.player) return;
                const minion = this.referDict.minion;
                const featureList = minion?.childDict.featureList;
                if (!featureList) return;
                featureList.accessFeature<
                    MurlocTidecallerBuffModel
                >('murloc-tidecaller-buff-feature');
            }
        )
    }
} 