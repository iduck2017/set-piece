import { Def } from "@/type/define";
import { CardDef, CardModel } from "./card";
import { Props } from "@/type/props";
import { Factory } from "@/service/factory";
import { MinionDef, MinionModel } from "./minion";

export type WispDef = Def.Merge<{
    code: 'wisp',
}>

@Factory.useProduct('wisp') 
export class WispModel extends MinionModel<WispDef> {
    constructor(props: Props<WispDef & CardDef & MinionDef>) {
        const superProps = MinionModel.mergeProps(props);
        super({
            childList: [],
            ...superProps,
            ...props,
            stateDict: {},
            paramDict: {
                name: 'Wisp',
                desc: 'Wisp'
            },
            childDict: {
                ...superProps.childDict,
                ...props.childDict
            }
        });
    }
}