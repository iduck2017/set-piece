import { decorConsumerResolver } from "../decor/decor-consumer-resolver";
import { decorProducerResolver } from "../decor/decor-producer-resolver";
import { LogLevel } from "../log/log-service";
import { useLog } from "../log/use-log";
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
            decorConsumerResolver.check() ||
            decorProducerResolver.check()
        if (!isDirty) return result;

        this.resolve()
        return result;
    }

    @useMicroAction()
    @useLog()
    private resolve() {
        memoResolver.resolve();
        decorConsumerResolver.resolve();
        decorProducerResolver.resolve();
    }
}

export const microActionManager = new MicroActionManager();
