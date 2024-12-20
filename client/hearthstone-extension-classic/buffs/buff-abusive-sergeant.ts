import { Factory } from "@/set-piece/services/factory";
import { Props } from "@/set-piece/types/props";
import { CustomDef, Def } from "@/set-piece";
import { BuffDef } from "@/hearthstone/models/buff";
import { BuffModel } from "@/hearthstone/models/buff";

export type BuffAbusiveSergeantDef = BuffDef<
    CustomDef<{
        code: 'buff-abusive-sergeant',
    }>
>

@Factory.useProduct('buff-abusive-sergeant')
export class BuffAbusiveSergeantModel extends BuffModel<BuffAbusiveSergeantDef> {
    constructor(props: Props<BuffAbusiveSergeantDef>) {
        const buffProps = BuffModel.buffProps(props);
        super({
            ...buffProps,
            paramDict: {
                name: 'Abusive Sergeant\'s Buff',
                desc: 'Give a minion +2 Attack this turn.',
                modAttack: 2,
                modHealth: 0,
                shouldDisposedOnRoundEnd: true
            },
            stateDict: {},
            childDict: {}
        });
    }
}

