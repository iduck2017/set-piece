import { CustomDef, Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";

export type WispDef = MinionDef<
    CustomDef<{
        code: 'minion-wisp',
    }>
>

@MinionModel.useRule({
    manaCost: 0,
    health: 1,
    attack: 1,
    races: []
})
@Factory.useProduct('minion-wisp') 
export class WispModel extends MinionModel<WispDef> {
    constructor(props: Props<WispDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Wisp',
                desc: '',
                flavor: 'If you hit an Eredar Lord with enough Wisps, it will explode. But why?'
            },
            stateDict: {}
        });
    }
}