import { BuffDef, BuffModel } from "@/hearthstone/models/buff";
import { FeatureDef, FeatureModel } from "@/hearthstone/models/feature";
import { CustomDef, FactoryService, Props } from "@/set-piece";

export type DebuffHuntersMarkDef = BuffDef<{
    code: 'hunters-mark-buff-feature',
}>

@FactoryService.useProduct('hunters-mark-buff-feature')
export class HuntersMarkDebuffModel extends BuffModel<DebuffHuntersMarkDef> {
    constructor(props: Props<DebuffHuntersMarkDef>) {
        const superProps = BuffModel.featureProps(props);
        super({
            ...superProps,
            stateDict: {},
            childDict: {},
            paramDict: {
                name: "Hunter's Mark Debuff",
                desc: "Health set to 1.",
                isReset: true,
                modHealth: 1
            }
        });
    }
}

