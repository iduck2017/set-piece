import { decorConsumerResolver } from "../decor/decor-consumer-resolver";
import { decorProducerResolver } from "../decor/decor-producer-resolver";
import { effectResolver } from "../effect/effect-resolver";
import { memoResolver } from "../memo/memo-resolver";
import { Tag } from "../tag/tag-registry";
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

    @useMicroAction()
    private resolve() {
        memoResolver.resolve();
        effectResolver.resolve();
        decorConsumerResolver.resolve();
        decorProducerResolver.resolve();
    }
}

export const microActionManager = new MicroActionManager();
