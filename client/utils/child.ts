import type { App } from "../app";
import type { Model } from "../models";
import { IReflect } from "../type";
import { IModel } from "../type/model";
import { ModelStatus } from "../type/status";

export function childListProxy<M extends IModel.Define>(
    config: IModel.ChildConfigList<M>,
    model: Model,
    app: App
): {
    proxy: IModel.ChildList<M>,
    hooks: IModel.ModelHookDict
} {
    const childList: IModel.ChildList<M> = [];
    for (const childConfig of config) {
        childList.push(app.factoryService.unserialize(childConfig));
    }

    const hooks: IModel.ModelHookDict = {
        $bootDriver: () => {
            for (const child of childList) {
                child.$bootDriver();
            }
        },
        $unbootDriver: () => {
            for (const child of childList) {
                child.$unbootDriver();
            }
        },
        $mountRoot: () => {
            for (const child of childList) {
                child.$mountRoot();
            }
        },
        $unmountRoot: () => {
            for (const child of childList) {
                child.$unmountRoot();
            }
        },
        $unbindParent: () => {
            for (const child of childList) {
                child.$unbindParent();
            }
        },
        $bindParent: (parent: Model) => {
            for (const child of childList) {
                child.$bindParent(parent);
            }
        },
        $makeBundle: () => {
            const bundle = [] as any;
            for (const child of childList) {
                bundle.push(child.makeBundle());
            }
            return bundle;
        }
    };
    const proxy = new Proxy(childList, {
        set: (target, key: any, value) => {
            target[key] = value;
            if (key !== Symbol.iterator && !isNaN(Number(key))) {
                console.log(key, value);
                const child: Model = value;
                child.$bindParent(model);
                if (child.status === ModelStatus.MOUNTED) {
                    child.$bootDriver();
                }
                model.$setChildren();
            }
            return true;
        },
        deleteProperty: (target, key: any) => {
            const value = target[key];
            console.log('delete_proxy', target, key, value.status);
            if (value.status === ModelStatus.MOUNTED) {
                value.$unbootDriver();
            }
            value.$unbindParent();
            delete target[key];
            target.length --;
            model.$setChildren();
            return true;
        }
    });

    return {
        proxy,
        hooks
    };
}


export function childDictProxy<M extends IModel.Define>(
    config: IModel.ChildConfigDict<M>,
    model: Model,
    app: App
): {
    proxy: IModel.ChildDict<M>,
    hooks: IModel.ModelHookDict
} {
    const childDict = {} as IModel.ChildDict<M>;
    for (const key in config) {
        childDict[key] = app.factoryService.unserialize(config[key]);
    }

    const hooks: IModel.ModelHookDict = {
        $bootDriver: () => {
            for (const key in childDict) {
                childDict[key].$bootDriver();
            }
        },
        $unbootDriver: () => {
            for (const key in childDict) {
                childDict[key].$unbootDriver();
            }
        },
        $mountRoot: () => {
            for (const key in childDict) {
                childDict[key].$mountRoot();
            }
        },
        $unmountRoot: () => {
            for (const key in childDict) {
                childDict[key].$unmountRoot();
            }
        },
        $unbindParent: () => {
            for (const key in childDict) {
                childDict[key].$unbindParent();
            }
        },
        $bindParent: (parent: Model) => {
            for (const key in childDict) {
                childDict[key].$bindParent(parent);
            }
        },
        $makeBundle: () => {
            const bundle = {} as any;
            for (const key in childDict) {
                bundle[key] = childDict[key].makeBundle();
            }
            return bundle;
        }
    };

    const proxy = new Proxy(childDict, {
        set: (
            target, 
            key: any, 
            value: Model
        ) => {
            target[key as IReflect.Key<IModel.ChildDict<M>>] = value as any;   
            value.$bindParent(model);
            if (value.status === ModelStatus.MOUNTED) {
                value.$bootDriver();
            }
            model.$setChildren();
            return true;
        },
        deleteProperty: (target, key: any) => {
            const value = target[key];
            if (value.status === ModelStatus.MOUNTED) {
                value.$unbootDriver();
            }
            value.$unbindParent();
            delete target[key];
            model.$setChildren();
            return true;
        }
    });

    return {
        proxy,
        hooks
    };
}
