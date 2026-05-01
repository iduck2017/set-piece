import { Decor } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag, tagRegistry } from "../tag/tag-registry";
import { decorProducerRegistry } from "./decor-producer-registry";
import { decorProducerDelegator } from "./decor-producer-delegator";
import { depService } from "../dep/dep-service";
import { useMicroAction } from "../action/use-micro-action";

class DecorProducerResolver {
    private _context: Set<Tag> = new Set();
    
    public check() {
        return Boolean(this._context.size)
    }

    public register(decorProducerTag: Tag): void
    public register(decorProducerModel: Model, decorType: Constructor<Decor>): void;

    @useMicroAction()
    public register(arg: Tag | Model, decorType?: Constructor<Decor>) {
        if (arg instanceof Model) {
            if (!decorType) return;
            const decorProducerModel = arg;
            const subConfig = decorProducerRegistry.query(decorProducerModel)
            subConfig.forEach((decorProducerLoader, key) => {
                if (decorProducerLoader() === decorType) {
                    const decorProducerTag = tagRegistry.query(decorProducerModel, key);
                    this.register(decorProducerTag)
                }
            })
        } else this._context.add(arg);
    }

    public resolve(): boolean {
        const depProducerTags = [...this._context];
        this._context.clear();
        
        if (!depProducerTags) return false;
        depProducerTags.forEach(decorProducerTag => {
            const decorProducerModel = decorProducerTag.target;
            const decorProducerKey = decorProducerTag.key;
            const prev = Reflect.get(decorProducerModel, decorProducerKey);
            decorProducerDelegator.clear(decorProducerTag);
            const next = Reflect.get(decorProducerModel, decorProducerKey);
            if (prev !== next) {
                // console.log('Decor changed:', decorProducerTag.name, prev, next);
                depService.register(decorProducerTag);
            }
        });
        return true;
    }
}
export const decorProducerResolver = new DecorProducerResolver();
