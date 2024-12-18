import { Def, Factory, Props } from "@/set-piece";
import { BuffModel, BuffDef } from "../buff";

export type BuffColdlightSeerDef = BuffDef<
    Def.Create<{
        code: 'buff-coldlight-seer'
    }>
>

@Factory.useProduct('buff-coldlight-seer')
export class BuffColdlightSeerModel extends BuffModel<BuffColdlightSeerDef> {
    constructor(props: Props<BuffColdlightSeerDef>) {
        const buffProps = BuffModel.buffProps(props);
        super({
            ...buffProps,
            paramDict: {
                name: 'Coldlight Seer\'s Buff',
                desc: '+2 Health',
                modAttack: 0,
                modHealth: 2,
                shouldDisposedOnRoundEnd: false
            },
            stateDict: {},
            childDict: {}
        });
    }
} 