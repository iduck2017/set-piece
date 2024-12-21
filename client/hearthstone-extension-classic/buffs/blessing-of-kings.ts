import { CustomDef, FactoryService, Props } from "@/set-piece";
import { BuffDef, BuffModel } from "@/hearthstone/models/buff";

export type BuffBlessingOfKingsDef = BuffDef<
    CustomDef<{
        code: 'buff-blessing-of-kings'
    }>
>

@FactoryService.useProduct('buff-blessing-of-kings')
export class BuffBlessingOfKingsModel extends BuffModel<BuffBlessingOfKingsDef> {
    constructor(props: Props<BuffBlessingOfKingsDef>) {
        const buffProps = BuffModel.buffProps(props);
        super({
            ...buffProps,
            paramDict: {
                name: 'Blessing of Kings\' Buff',
                desc: 'Give a minion +4/+4.',
                modAttack: 4,
                modHealth: 4,
            },
            stateDict: {},
            childDict: {}
        });
    }
}
