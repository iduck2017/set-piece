import { Model } from "..";
import { RawModelDefine } from "../../type/define";
import { Archieve } from "./archieve";
import { Inspector } from "./inspector";

export type ServiceDefine = 
    RawModelDefine<{
        type: 'service',
        stateMap: {},
        childMap: {
            archieve: Archieve,
            inspector: Inspector,
        }
    }>

@Model.useProduct('service')
export class Service extends Model<
    ServiceDefine
> { 
    constructor(
        config: Service['config']
    ) {
        super({
            ...config,
            stateMap: {},
            childMap: {
                archieve: { type: 'archieve' },
                inspector: { type: 'inspector' },
                ...config.childMap
            }
        });
    }

    @Model.useDebug()
    async save() {
        await localStorage.setItem(
            'service', 
            JSON.stringify(this.config)
        );
    }
}
