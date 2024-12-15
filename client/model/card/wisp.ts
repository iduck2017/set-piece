import { Def } from "@/type/define";
import { CardDef } from ".";
import { Props } from "@/type/props";
import { Factory } from "@/service/factory";
import { MinionDef, MinionModel } from "./minion";
import { DataBase } from "@/service/database";

export type WispDef = Def.Create<{
    code: 'wisp',
}>

@DataBase.useCard({})
@MinionModel.useRule({
    manaCost: 0,
    health: 1,
    attack: 1
})
@Factory.useProduct('wisp') 
export class WispModel extends MinionModel<WispDef> {
    constructor(props: Props<WispDef & CardDef & MinionDef>) {
        const superProps = MinionModel.minionProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Wisp',
                desc: ''
            },
            stateDict: {}
        });
    }
}