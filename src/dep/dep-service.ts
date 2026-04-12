import { decorConsumerResolver } from "../decor/decor-consumer-resolver";
import { effectResolver } from "../effect/effect-resolver";
import { eventConsumerResolver } from "../event/event-consumer-resolver";
import { useConsoleLog } from "../log/use-console-log";
import { memoResolver } from "../memo/memo-resolver";
import { useMicroTask } from "../task/use-micro-task";
import { Tag } from "../tag/tag-registry";

class DepService {
    @useConsoleLog()
    @useMicroTask()
    public register(tag: Tag) {
        memoResolver.register(tag);
        effectResolver.register(tag);
        eventConsumerResolver.register(tag);
        decorConsumerResolver.register(tag)
    }
}
export const depService = new DepService();