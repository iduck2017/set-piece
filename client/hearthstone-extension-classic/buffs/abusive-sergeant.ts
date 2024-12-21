import { FactoryService } from "@/set-piece/services/factory";
import { Props } from "@/set-piece/types/props";
import { CustomDef, Def } from "@/set-piece";
import { BuffDef } from "@/hearthstone/models/buff";
import { BuffModel } from "@/hearthstone/models/buff";

/**
 * @example 叫嚣的中士的效果，因为施加在其它随从上，因此被抽离成单独一个类，因为是正向的效果，所以前缀是buff
 * 注意：并非所有随从都需要抽出一个effect类
 */

export type BuffAbusiveSergeantDef = BuffDef<
    CustomDef<{
        code: 'abusive-sergeant-buff-feature',
    }>
>

@FactoryService.useProduct('abusive-sergeant-buff-feature')
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

