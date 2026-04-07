import { effectResolver } from "../effect/effect-resolver";
import { eventResolver } from "../event/event-resolver";
import { decorConsumerResolver } from "../decor/decor-consumer-resolver";
import { Field } from "../utils/field-registry";
import { memoResolver } from "../memo/memo-resolver";

class DepResolver {
    public resolve(dep: Field) {
        memoResolver.resolve(dep)
        decorConsumerResolver.resolve(dep);
        eventResolver.register(dep);
        effectResolver.register(dep);
    }
}

export const depResolver = new DepResolver()