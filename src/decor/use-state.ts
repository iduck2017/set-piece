import { Decor } from ".";
import { useDep } from "../dep/use-dep";
import { Model } from "../model";
import { Constructor } from "../types";
import { tagDelegator } from "../tag/tag-delegator";
import { tagRegistry } from "../tag/tag-registry";
import { decorProducerDelegator } from "./decor-producer-delegator";
import { DecorProducerLoader, decorProducerRegistry } from "./decor-producer-registry";
import { decorProducerResolver } from "./decor-producer-resolver";
import { decorService } from "./decor-service";
import { useDecorProducer } from "./use-decor-producer";

export function useState<
    M extends Model & Record<string, any>,
    K extends string,
>(loader?: DecorProducerLoader<M[K]>) {
    return function(
        prototype: M,
        key: K,
    ) {
        useDep()(prototype, key);
        if (!loader) return;
        useDecorProducer(loader)(prototype, key)
    }
}
