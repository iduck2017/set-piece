import { CustomDef, FactoryService, Props } from "@/set-piece";
import { BuffDef, BuffModel } from "@/hearthstone/models/buff";

export type BuffBlessingOfKingsDef = BuffDef<
    CustomDef<{
        code: 'blessing-of-kings-buff-feature'
    }>
>

@FactoryService.useProduct('blessing-of-kings-buff-feature')
export class BlessingOfKingsBuffModel extends BuffModel<BuffBlessingOfKingsDef> {
    constructor(props: Props<BuffBlessingOfKingsDef>) {
        const superProps = BuffModel.buffProps(props);
        super({
            ...superProps,
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
