import type { AppInfo } from "../app";
import type { RootModelDef } from "../models/root";
import { PureModelConfig } from "../type/model";
import { ModelCode } from "../type/model-reg";
import { MAJOR_VERSION, MINOR_VERSION, PATCH_VERSION } from "./context";

export namespace Generator {
    export function appInfo(): AppInfo {
        return {
            majorVersion: MAJOR_VERSION,
            minorVersion: MINOR_VERSION,
            patchVersion: PATCH_VERSION,
            archieveDataList: [],
            perferenceData: {
                mute: false,
                fullscreen: true
            }
        };
    }

    export function rootConfig(): PureModelConfig<RootModelDef> {
        return {
            code: ModelCode.Root
        };
    }
}