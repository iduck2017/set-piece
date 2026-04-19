import { decorConsumerResolver } from "../decor/decor-consumer-resolver";
import { effectResolver } from "../effect/effect-resolver";
import { deferEffectResolver } from "../effect/defer-effect-resolver";
import { eventConsumerResolver } from "../event/event-consumer-resolver";
import { useLog } from "../log/use-log";
import { memoResolver } from "../memo/memo-resolver";
import { useMicroAction } from "../action/use-micro-action";
import { Tag } from "../tag/tag-registry";

class DepService {
    @useLog()
    @useMicroAction()
    public register(tag: Tag) {
        memoResolver.register(tag);
        effectResolver.register(tag);
        deferEffectResolver.register(tag);
        eventConsumerResolver.register(tag);
        decorConsumerResolver.register(tag)
    }
}
export const depService = new DepService();