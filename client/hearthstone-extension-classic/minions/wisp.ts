import { CustomDef, Def, FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";

export type WispDef = MinionDef<
    CustomDef<{
        code: 'minion-wisp',
    }>
>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 1,
        races: []
    },
    castable: {
        manaCost: 0
    }
})
@FactoryService.useProduct('minion-wisp') 
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