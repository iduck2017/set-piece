import { RootModel } from "../models/root";
import { AppInfo } from "../type/app";
import { ModelCode } from "../type/code";
import { ModelReflect } from "../type/model";
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

    export function initRootModelConfig(): ModelReflect.Config<RootModel> {
        return {
            code: ModelCode.Root
        };
    }
}