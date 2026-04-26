import { runAction, useAction } from "./action/use-action";
import { Model } from "./model";
import { Constructor } from "./types";
import { storeRegistry } from "./store/store-registry";

class ModelResolver {
    private _isPending = false;
    private _models: Model[] = [];

    public delegate<T extends Model>(Constructor: Constructor<Model>): Constructor<T> {
        const that = this;
        const ReactiveConstructor = {
            [Constructor.name]: class extends Constructor {
                constructor(...params: any[]) {
                    if (that._isPending) {
                        super(...params);
                        that._models.push(this);
                    }
                    else {
                        that._isPending = true;
                        super(...params);
                        that._models.push(this);
                        that._isPending = false;
                        const models = [...that._models];
                        that._models = [];
                        console.log('init model', models.length, Constructor.name)
                        models.forEach(model => model._internal.init());
                    }
                }
            }
        }[Constructor.name];
        return ReactiveConstructor as Constructor<T>;
    }
}
export const modelResolver = new ModelResolver()

export function useModel(code: string) {
    return function<T extends Model>(Constructor: Constructor<T>): any {
        storeRegistry.register(code, Constructor);
        return modelResolver.delegate(Constructor)
    }
}
