import type { App } from "../app";
import type { Model } from "../models";
import { IModel } from "../type/model";
import { ModelStatus } from "../type/status";

export function childListProxy<M extends IModel.Define>(
    config: IModel.ChildConfigList<M>,
    model: Model,
    app: App
): IModel.ChildList<M> & IModel.HookDict {
    const childList: IModel.ChildList<M> = [];
    for (const childConfig of config) {
        childList.push(app.factoryService.unserialize(childConfig));
    }

    const hookDict: IModel.HookDict = {
        $bootModel: () => childList.forEach(child => child.$bootModel()),
        $unbootModel: () => childList.forEach(child => child.$unbootModel()),
        $mountRoot: () => childList.forEach(child => child.$mountRoot()),
        $unmountRoot: () => childList.forEach(child => child.$unmountRoot()),
        $unbindParent: () => childList.forEach(child => child.$unbindParent()),
        $bindParent: (parent: Model) => childList.forEach(child => child.$bindParent(parent))
    };

    return new Proxy(childList, {
        get: (target, key: any) => {
            if (Object.keys(hookDict).includes(key)) {
                return hookDict[key as keyof IModel.HookDict];
            }
            return target[key];
        },
        set: (target, key: any, value) => {
            target[key] = value;
            if (key !== Symbol.iterator && !isNaN(Number(key))) {
                console.log(key, value);
                const child: Model = value;
                child.$bindParent(model);
                if (child.status === ModelStatus.MOUNTED) {
                    child.$bootModel();
                }
                model.$setChildren();
            }
            return true;
        },
        deleteProperty: (target, key: any) => {
            const value = target[key];
            if (value.status === ModelStatus.MOUNTED) {
                value.$unbootModel();
            }
            value.$unbindParent();
            delete target[key];
            model.$setChildren();
            return true;
        }
    }) as IModel.ChildList<M> & IModel.HookDict;
}
