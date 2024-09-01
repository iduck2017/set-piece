import { AppInfo } from "../type/app";
import { RootModelDef } from "../type/definition";
import { ModelType } from "../type/model";
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

    export function initRootModelConfig(): ModelType.RawConfig<RootModelDef> {
        return {
            code: ModelCode.Root
        };
    }
}