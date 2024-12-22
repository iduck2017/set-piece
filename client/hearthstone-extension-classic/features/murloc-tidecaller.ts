import { FactoryService, LifecycleService, Model, Props, ValidatorService } from "@/set-piece";
import { FeatureDef, FeatureModel } from "@/hearthstone/models/feature";
import {  MinionModel } from "@/hearthstone/models/minion";
import { RaceType } from "@/hearthstone/services/database";
import { Mutator } from "@/set-piece/utils/mutator";
import { CombativeModel } from "@/hearthstone/models/combative";

export type FeatureMurlocTidecallerDef = FeatureDef<{
    code: 'murloc-tidecaller-feature',
    stateDict: {
        modAttack: number
    }
}>

@FactoryService.useProduct('murloc-tidecaller-feature')
export class MurlocTidecallerFeatureModel extends FeatureModel<FeatureMurlocTidecallerDef> {
    constructor(props: Props<FeatureMurlocTidecallerDef>) {
        const superProps = FeatureModel.featureProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Murloc Tidecaller\'s Effect',
                desc: 'Whenever a Murloc is summoned, gain +1 Attack.'
            },
            stateDict: {
                modAttack: 0,
                ...superProps.stateDict
            },
            childDict: {}
        });
    }

    private _buff(
        target: CombativeModel,
        mutator: Mutator<Model.StateDict<CombativeModel>>
    ) {
        mutator.data.attack += this.stateDict.modAttack;
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenStateCheck() {
        const minion = this.referDict.minion;
        if (!minion) return;
        const combative = minion.childDict.combative;
        if (!combative) return;
        this.bindEvent(
            combative.eventEmitterDict.onStateCheck,
            this._buff
        )
    }

    private getTargetList() {
        const game = this.referDict.game;
        if (!game) return [];
        const result = game.queryTargetList({
            excludeTarget: this.referDict.minion,
            excludePlayer: true,
            requiredRaces: [RaceType.Murloc]
        })
        console.log('[query]', result);
        return result;
    }

    @LifecycleService.useLoader()
    @ValidatorService.useCondition(model => Boolean(model.referDict.board))
    private _listenMinionSummon() {
        const game = this.referDict.game;
        if (!game) return;
        this.bindEvent(
            game.eventEmitterDict.onMinionSummon,
            (target: MinionModel) => {
                const targetList = this.getTargetList();
                if (!targetList.includes(target)) return;
                this.baseStateDict.modAttack += 1;
                const minion = this.referDict.minion;
                const combative = minion?.childDict.combative;
                if (!combative) return;
                combative.onStateAlter();
            }
        )
    }
} 