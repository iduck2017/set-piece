import { CustomDef, Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";
import { FeatureBloodImpModel } from "../features/feature-blood-imp";

/**
 * @prompt
 * Blood Imp 1/0/1 Stealth. At the end of your turn, give another random friendly minion +1 Health.
 * Stealth is a fixed property in CombatableModel
 */

export type BloodImpDef = MinionDef<
    CustomDef<{
        code: 'blood-imp',
        childDict: {
            feature: FeatureBloodImpModel
        }
    }>
>

@MinionModel.useRule({
    manaCost: 1,
    health: 1,
    attack: 0,
    races: [],
    isStealth: true
})
@Factory.useProduct('blood-imp')
export class BloodImpModel extends MinionModel<BloodImpDef> {
    constructor(props: Props<BloodImpDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Blood Imp',
                // eslint-disable-next-line max-len
                desc: 'Stealth. At the end of your turn, give another random friendly minion +1 Health.'
            },
            stateDict: {},
            childDict: {
                feature: { code: 'feature-blood-imp' },
                ...superProps.childDict
            }
        });
    }
}


