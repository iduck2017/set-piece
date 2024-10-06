import type { MetaData } from "../app";
import type { RootModelDef } from "../models/root";
import { ModelCode } from "../services/factory";
import { PureModelConfig } from "../type/model";
import { MAJOR_VERSION, MINOR_VERSION, PATCH_VERSION } from "./context";

export namespace Generator {
    export function appMetaData(): MetaData {
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

    export function rootModelConfig(): PureModelConfig<RootModelDef> {
        return {
            code: ModelCode.Root
        };
    }
}