import { Def, Factory, Lifecycle, Props } from "@/set-piece";
import { FeatureDef, FeatureModel } from "../feature";
import { DoomsayerModel } from "../minions/doomsayer";

export type FeatureDoomsayerDef = FeatureDef<
    Def.Create<{
        code: 'feature-doomsayer',
        parent: DoomsayerModel
    }>
>

@Factory.useProduct('feature-doomsayer')
export class FeatureDoomsayerModel extends FeatureModel<FeatureDoomsayerDef> {
    constructor(props: Props<FeatureDoomsayerDef>) {
        super({
            ...props,
            paramDict: {
                name: 'Doomsayer\'s Effect',
                desc: 'At the start of your turn, destroy ALL minions.'
            },
            stateDict: {},
            childDict: {}
        });
    }

    @Lifecycle.useLoader()
    private _handleStartOfTurn() {
        const minion = this.refer.minion;
        const game = this.refer.game;
        if (!minion || !game) return;

        this.bindEvent(
            game.eventEmitterDict.onRoundStart,
            () => {
                const allMinions = this.refer.queryMinionList({});
                allMinions.forEach(target => {
                    target.childDict.combatable.destroy();
                });
            }
        );
    }
} 