import { FactoryService } from "@/set-piece/services/factory";
import { Props } from "@/set-piece/types/props";
import { CustomDef, Def } from "@/set-piece";
import { BuffDef } from "@/hearthstone/models/buff";
import { BuffModel } from "@/hearthstone/models/buff";

export type BuffAbusiveSergeantDef = BuffDef<{
    code: 'abusive-sergeant-buff-feature',
}>

@FactoryService.useProduct('abusive-sergeant-buff-feature')
export class AbusiveSergeantBuffModel extends BuffModel<BuffAbusiveSergeantDef> {
    constructor(props: Props<BuffAbusiveSergeantDef>) {
        const superProps = BuffModel.buffProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Abusive Sergeant\'s Buff',
                desc: 'Give a minion +2 Attack this turn.',
                modAttack: 2,
                isTemperary: true
            },
            childDict: {}
        });
    }
}

