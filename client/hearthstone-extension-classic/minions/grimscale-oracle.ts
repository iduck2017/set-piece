import { FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, RarityType, ExpansionType, RaceType } from "@/hearthstone/services/database";
import { GrimscaleOracleFeatureModel } from "../features/grimscale-oracle";

/**
 * Card: Grimscale Oracle
 * Cost: 1
 * Attack: 1
 * Health: 1
 * Text: ALL other Murlocs have +1 Attack.
 * Flavor: These are the brainy murlocs. It turns out that doesn't mean much.
 */
export type GrimscaleOracleDef = MinionDef<{
    code: 'grimscale-oracle-minion-card',
    childDict: {
        ongoingEffect: GrimscaleOracleFeatureModel
    }
}>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 1,
        races: [ RaceType.Murloc]
    },
    castable: {
        manaCost: 1
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Free,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('grimscale-oracle-minion-card')
export class GrimscaleOracleModel extends MinionModel<GrimscaleOracleDef> {
    constructor(props: Props<GrimscaleOracleDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Grimscale Oracle',
                desc: 'ALL other Murlocs have +1 Attack.',
                flavor: 'These are the brainy murlocs. It turns out that doesn\'t mean much.'
            },
            stateDict: {},
            childDict: {
                ongoingEffect: {
                    code: 'grimscale-oracle-ongoing-effect-feature'
                },
                ...superProps.childDict
            }
        });
    }

    override debug() {
        super.debug();
        this.childDict.ongoingEffect?.debug({
            eventDependency: true
        });
    }
}