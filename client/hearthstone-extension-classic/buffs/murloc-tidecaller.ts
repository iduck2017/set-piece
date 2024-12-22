import { FactoryService, Props } from "@/set-piece";
import { BuffDef, BuffModel } from "@/hearthstone/models/buff";

export type BuffMurlocTidecallerDef = BuffDef<{
    code: 'murloc-tidecaller-buff-feature'
}>

@FactoryService.useProduct('murloc-tidecaller-buff-feature')
export class MurlocTidecallerBuffModel extends BuffModel<BuffMurlocTidecallerDef> {
    constructor(props: Props<BuffMurlocTidecallerDef>) {
        const superProps = BuffModel.buffProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Murloc Tidecaller\'s Buff',
                desc: 'Gained +1 Attack from a Murloc being summoned.',
                modAttack: 1,
            },
            childDict: {}
        });
    }
} 