import { IModel } from "..";
import { RawModelDefine } from "../../type/define";
import { App } from "../app";
import { Archieve } from "./archieve";

export type ServiceDefine = 
    RawModelDefine<{
        type: 'service',
        stateMap: {},
        childMap: {
            archieve: Archieve,
        },
        parent: App
    }>

@IModel.useProduct('service')
export class Service extends IModel<
    ServiceDefine
> { 
    private static _main: Service;
    public static get main() {
        return this._main;
    }

    constructor(
        config: Service['config'], 
        parent: App
    ) {
        super({
            ...config,
            stateMap: {},
            childMap: {
                archieve: { type: 'archieve' },
                ...config.childMap
            },
            referMap: {}
        }, parent);
        Service._main = this;
    }

    @IModel.useDebugger()
    async save() {
        await localStorage.setItem(
            'service', 
            JSON.stringify(this.config)
        );
    }
}
