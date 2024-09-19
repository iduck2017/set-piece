import type { MetaData } from "../app";
import type { RootModelDefine } from "../models/root";
import { IModel } from "../type/model";
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

    export function rootModelConfig(): IModel.Config<RootModelDefine> {
        return {
            code: ModelCode.Root
        };
    }
}