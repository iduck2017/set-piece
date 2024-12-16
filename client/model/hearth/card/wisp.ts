import { Def } from "@/type/define";
import { CardDef } from "./card";
import { Props } from "@/type/props";
import { Factory } from "@/service/factory";
import { MinionDef, MinionModel } from "./minion";

export type WispDef = Def.Create<{
    code: 'wisp',
}>

@MinionModel.useRule({
    manaCost: 0,
    health: 1,
    attack: 1,
    races: []
})
@Factory.useProduct('wisp') 
export class WispModel extends MinionModel<WispDef> {
    constructor(props: Props<WispDef & CardDef & MinionDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                races: [],
                name: 'Wisp',
                desc: ''
            },
            stateDict: {}
        });
    }
}