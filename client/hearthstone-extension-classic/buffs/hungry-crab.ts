import { FactoryService, Props } from "@/set-piece";
import { BuffDef, BuffModel } from "@/hearthstone/models/buff";

export type BuffHungryCrabDef = BuffDef<{
    code: 'hungry-crab-buff-feature'
}>

@FactoryService.useProduct('hungry-crab-buff-feature')
export class HungryCrabBuffModel extends BuffModel<BuffHungryCrabDef> {
    constructor(props: Props<BuffHungryCrabDef>) {
        const superProps = BuffModel.buffProps(props);
        super({
            ...superProps,
            paramDict: {
                name: 'Hungry Crab\'s Buff',
                desc: 'Gained +2/+2 from eating a Murloc.',
                modAttack: 2,
                modHealth: 2,
            },
            childDict: {}
        });
    }
} 