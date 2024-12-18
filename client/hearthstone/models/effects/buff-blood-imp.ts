import { Def, Factory, Props } from "@/set-piece";
import { BuffModel, BuffDef } from "../buff";

export type BuffBloodImpDef = BuffDef<
    Def.Create<{
        code: 'buff-blood-imp'
    }>
>

@Factory.useProduct('buff-blood-imp')
export class BuffBloodImpModel extends BuffModel<BuffBloodImpDef> {
    constructor(props: Props<BuffBloodImpDef>) {
        const buffProps = BuffModel.buffProps(props);
        super({
            ...buffProps,
            paramDict: {
                name: 'Blood Imp\'s Buff',
                desc: '+1 Health',
                modAttack: 0,
                modHealth: 1,
                shouldDisposedOnRoundEnd: false
            },
            stateDict: {},
            childDict: {}
        });
    }
} 