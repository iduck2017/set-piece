import { MetaData } from "../app";
import { RootModelDefine } from "../models/root";
import { IBase, IReflect } from "../type";
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

    export function pureHandlerDict(): IModel.EventHandlerDict<IModel.PureDefine> {
        return {
            modifier: {},
            listener: {},
            observer: {}
        };
    }

    export function readonlyProxy<T extends IBase.Dict>(
        get: <K extends IReflect.Key<T>>(target: T, key: K) => T[K]
    ) {
        return new Proxy({} as T, {
            get: get,
            set: () => false
        });
    }
}