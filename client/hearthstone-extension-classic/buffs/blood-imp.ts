import { BuffDef, BuffModel } from "@/hearthstone/models/buff";
import { CustomDef, FactoryService, Props } from "@/set-piece";

export type BuffBloodImpDef = BuffDef<{
    code: 'blood-imp-buff-feature',
}>

@FactoryService.useProduct('blood-imp-buff-feature')
export class BloodImpBuffModel extends BuffModel<BuffBloodImpDef> {
    constructor(props: Props<BuffBloodImpDef>) {
        const superProps = BuffModel.buffProps(props);
        super({
            ...superProps,
            paramDict: {
                name: "Blood Imp's Buff",
                desc: "+1 Health.",
                modAttack: 0,
                modHealth: 1
            },
            childDict: {}
        });
    }
} 