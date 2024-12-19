import { Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { FeatureDoomsayerModel } from "../features/feature-doomsayer";

/**
 * @prompt
 * Doomsayer 2/0/7 At the start of your turn, destroy ALL minions.
 */

export type DoomsayerDef = MinionDef<
    Def.Create<{
        code: 'doomsayer',
        childDict: {
            feature: FeatureDoomsayerModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 2,
    health: 7,
    attack: 0,
    races: []
})
@Factory.useProduct('doomsayer')
export class DoomsayerModel extends MinionModel<DoomsayerDef> {
    constructor(props: Props<DoomsayerDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Doomsayer',
                desc: 'At the start of your turn, destroy ALL minions.'
            },
            stateDict: {},
            childDict: {
                feature: { code: 'feature-doomsayer' },
                ...superProps.childDict
            }
        });
    }
} 