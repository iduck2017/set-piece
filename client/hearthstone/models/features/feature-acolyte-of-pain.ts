import { Def, Factory, Lifecycle, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { AcolyteOfPainModel } from "../minions/acolyte-of-pain";

export type FeatureAcolyteOfPainDef = FeatureDef<
    Def.Create<{
        code: 'feature-acolyte-of-pain',
        parent: AcolyteOfPainModel
    }>
>

@Factory.useProduct('feature-acolyte-of-pain')
export class FeatureAcolyteOfPainModel extends FeatureModel<FeatureAcolyteOfPainDef> {
    constructor(props: Props<FeatureAcolyteOfPainDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Acolyte of Pain\'s Effect',
                desc: 'Draw a card when damaged.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    @Lifecycle.useLoader()
    private _handleDamage() {
        const deck = this.refer.playerDeck;
        const combatable = this.refer.minionCombatable;
        if (!deck || !combatable) return;

        this.bindEvent(
            combatable.eventEmitterDict.onReceiveDamage,
            () => {
                deck.drawCard();
            }
        );
    }
} 