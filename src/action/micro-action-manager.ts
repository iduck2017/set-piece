import { decorConsumerResolver } from "../decor/decor-consumer-resolver";
import { decorProducerResolver } from "../decor/decor-producer-resolver";
import { effectResolver } from "../effect/effect-resolver";
import { memoResolver } from "../memo/memo-resolver";
import { Model } from "../model";
import { Tag } from "../tag/tag-registry";
import { Constructor } from "../types";
import { useAction } from "./use-action";
import { useMicroAction } from "./use-micro-action";

class MicroActionManager {
    private _isPending = false;

    @useAction()
    public run(handler: () => unknown) {
        if (this._isPending) return handler();
        this._isPending = true;
        const result = handler();
        this._isPending = false;

        const isDirty =
            memoResolver.check() ||
            effectResolver.check() ||
            decorConsumerResolver.check() ||
            decorProducerResolver.check()
        if (!isDirty) return result;

        this.resolve()
        return result;
    }

    public delegate<T extends Model>(Constructor: Constructor<Model>): Constructor<T> {
        const that = this;
        const ReactiveConstructor = {
            [Constructor.name]: class extends Constructor {
                constructor(...params: any[]) {
                    if (that._isPending) {
                        super(...params);
                        return;
                    }
                    that._isPending = true;
                    super(...params);
                    that._isPending = false;
                    const isDirty =
                        memoResolver.check() ||
                        effectResolver.check() ||
                        decorConsumerResolver.check() ||
                        decorProducerResolver.check()
                    if (!isDirty) return;
                    that.resolve();
                }
            }
        }[Constructor.name];
        return ReactiveConstructor as Constructor<T>;
    }

    @useMicroAction()
    private resolve() {
        memoResolver.resolve();
        effectResolver.resolve();
        decorConsumerResolver.resolve();
        decorProducerResolver.resolve();
    }
}

export const microActionManager = new MicroActionManager();
