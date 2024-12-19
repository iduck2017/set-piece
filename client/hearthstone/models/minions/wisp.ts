import { CustomDef, Def, Factory, Props } from "@/set-piece";
import { MinionDef, MinionModel } from "../minion";

export type WispDef = MinionDef<
    CustomDef<{
        code: 'wisp',
    }>
>

@MinionModel.useRule({
    manaCost: 0,
    health: 1,
    attack: 1,
    races: []
})
@Factory.useProduct('wisp') 
export class WispModel extends MinionModel<WispDef> {
    constructor(props: Props<WispDef>) {
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