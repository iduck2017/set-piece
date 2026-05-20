import { decorConsumerResolver } from "../../model/decor/decor-consumer-resolver";
import { effectResolver } from "../../model/effect/effect-resolver";
import { deferEffectResolver } from "../../model/effect/defer-effect-resolver";
import { eventConsumerResolver } from "../../model/event/event-consumer-resolver";
import { frameConsumerResolver } from "../frame/frame-consumer-resolver";
import { memoResolver } from "../../model/memo/memo-resolver";
import { Tag } from "../tag/tag-registry";
import { useMicroAction } from "../action/micro-manager";

class DepService {
    @useMicroAction()
    public register(tag: Tag) {
        memoResolver.register(tag);
        effectResolver.register(tag);
        deferEffectResolver.register(tag);
        eventConsumerResolver.register(tag);
        decorConsumerResolver.register(tag);
        frameConsumerResolver.register(tag);
    }
}
export const depService = new DepService();