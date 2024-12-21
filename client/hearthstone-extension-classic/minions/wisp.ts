import { CustomDef, Def, FactoryService, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "@/hearthstone/models/minion";
import { ClassNameType, RarityType } from "@/hearthstone/services/database";
import { ExpansionType } from "@/hearthstone/services/database";

export type WispDef = MinionDef<{
    code: 'wisp-minion-card',
}>

@MinionModel.useRule({
    combative: {
        health: 1,
        attack: 1,
        races: []
    },
    castable: {
        manaCost: 0
    },
    card: {
        expansion: ExpansionType.Classic,
        rarity: RarityType.Common,
        className: ClassNameType.Neutral
    }
})
@FactoryService.useProduct('wisp-minion-card') 
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