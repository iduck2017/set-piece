import { Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";

/**
 * @prompt
 * Ancient Watcher 2/4/5 Can't attack.
 * cantAttack is a fixed property in CombatableModel
 */

export type AncientWatcherDef = MinionDef<
    Def.Create<{
        code: 'ancient-watcher'
    }>
>

@MinionModel.useRule({
    manaCost: 2,
    health: 5,
    attack: 4,
    races: [],
    cantAttack: true
})
@Factory.useProduct('ancient-watcher')
export class AncientWatcherModel extends MinionModel<AncientWatcherDef> {
    constructor(props: Props<AncientWatcherDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Ancient Watcher',
                desc: 'Can\'t attack.'
            },
            stateDict: {}
        });
    }
} 