import { AppInfo } from "../type/app";
import { IModelDef } from "../type/definition";
import { ModelDecl } from "../type/model";
import { ModelCode } from "../type/registry";
import { Context } from "./context";

export namespace Generator {
    export function initAppMetaData(): AppInfo.MetaData {
        return {
            version: Context.APP_VERSION,
            archieves: [],
            settings: {
                mute: false,
                fullscreen: true
            }
        };
    }

    export function initRootModelConfig(): ModelDecl.RawConfig<IModelDef.Root> {
        return {
            code: ModelCode.Root
        };
    }
}