import type { MetaData } from "../app";
import type { RootModelDef } from "../models/root";
import { ModelDef } from "../type/model-def";
import { ModelCode } from "../type/registry";
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

    export function rootModelConfig(): IModel.Config<RootModelDef> {
        return {
            code: ModelCode.Root
        };
    }
}