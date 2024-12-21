import { BuffDef, BuffModel } from "@/hearthstone/models/buff";
import { CustomDef, FactoryService, Props } from "@/set-piece";

export type BuffInnerRageDef = BuffDef<
    CustomDef<{
        code: 'inner-rage-buff-feature',
    }>
>

@FactoryService.useProduct('inner-rage-buff-feature')
export class BuffInnerRageModel extends BuffModel<BuffInnerRageDef> {
    constructor(props: Props<BuffInnerRageDef>) {
        const superProps = BuffModel.buffProps(props);
        super({
            ...superProps,
            paramDict: {
                name: "Inner Rage Buff",
                desc: "+2 Attack.",
                modAttack: 2,
                modHealth: 0
            },
            stateDict: {},
            childDict: {}
        });
    }
} 