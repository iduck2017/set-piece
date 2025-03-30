import { DecorProvider, DecorReceiver, DecorReceivers, DecorUpdater } from "@/types/decor";
import { SubModel } from ".";
import { Value } from "@/types";
import { Model } from "@/model/model";
import { DebugContext } from "@/context/debug";

export class DecorModel<
    S1 extends Record<string, Value>,
    M extends Model
> extends SubModel<M> {
    readonly receivers: Readonly<DecorReceivers<S1, M>>;
    
    private readonly router: Map<string, DecorProvider[]>;
    private readonly routerInvert: Map<DecorUpdater, DecorReceiver[]>;

    constructor(target: M) {
        super(target)
        this.router = new Map();
        this.routerInvert = new Map();
        this.receivers = new Proxy({} as any, {
            get: this.getReceiver.bind(this)
        })
    }

    private getReceiver(origin: any, path: string) { 
        const agent = this.target.agent;
        return Reflect.get(agent.decor, path)
    }
    
    private static hooks: Map<Function, Record<string, 
        Array<(model: Model) => DecorReceiver | undefined>
    >> = new Map();
    
    @DebugContext.log()
    public static use<S, M extends Model>(accessor: (model: M) => DecorReceiver<S, M> | undefined) {
        return function(
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<DecorUpdater<S, M>>
        ): TypedPropertyDescriptor<DecorUpdater<S, M>> {
            const hooks = DecorModel.hooks.get(target.constructor) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(accessor);
            DecorModel.hooks.set(target.constructor, hooks);
            return descriptor;
        };
    }

    @DebugContext.log()
    public emit<S>(key: string) {
        let target: Model | undefined = this.target;
        let result = Reflect.get(this.stateModel.draft, key);
        let path = key;
        console.log('stateOrigin', key, result)
        while (target) {
            console.log('emitDecor', path, target.code);
            const router = target.decorModel.router;
            const providers = router.get(path) ?? [];
            for (const provider of providers) {
                console.log(provider)
                const target = provider.target;
                const updater = provider.updater;
                result = updater.call(target, this.target, result);
            }
            path = target.path + '/' + path;
            target = target.parent;
        }
        console.log('stateComputed', key, result);
        return result;
    }

    @DebugContext.log()
    protected bind<E, M extends Model>(
        receiver: DecorReceiver<E, M>, 
        updater: DecorUpdater<E, M>
    ) {
        console.log(receiver, updater)
        const { target, path } = receiver;
        const router = target.decorModel.router;
        const providers = router.get(path) ?? [];
        providers.push({ target: this.target, updater });
        router.set(path, providers);
        const receivers = this.routerInvert.get(updater) ?? [];
        receivers.push(receiver);
        this.routerInvert.set(updater, receivers);
        target.stateModel.check(path);
    }

    @DebugContext.log()
    protected unbind<S, M extends Model>(
        receiver: DecorReceiver<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { target, path } = receiver;
        const router = target.decorModel.router;
        let providers = router.get(path) ?? [];
        providers = providers.filter(item => {
            if (item.updater !== updater) return true;
            if (item.target !== this.target) return true;
            return false;
        });
        router.set(path, providers);
        let receivers = this.routerInvert.get(updater) ?? [];
        receivers = receivers.filter(item => item !== receiver);
        this.routerInvert.set(updater, receivers);
        target.stateModel.check(path)
    }

    @DebugContext.log()
    public load() {
        console.log(DecorModel.hooks)
        let constructor = this.target.constructor;
        const target = this.target
        while (constructor) {
            const hooks = DecorModel.hooks.get(constructor) ?? {};
            for (const key of Object.keys(hooks)) {
                const accessors = hooks[key];
                for (const accessor of accessors) {
                    const producer = accessor(target);
                    if (!producer) continue;
                    const handler: any = Reflect.get(target, key)
                    this.bind(producer, handler);
                }
            }
            constructor = Reflect.get(constructor, '__proto__');
        }
        this.stateModel.commit()
    }

    @DebugContext.log()
    public unload() {
        for (const channel of this.routerInvert) {
            const [ handler, producers ] = channel
            for (const producer of producers) {
                this.unbind(producer, handler);
            }
        }
        for (const channel of this.router) {
            const [ path, consumers ] = channel;
            const receiver = this.receivers[path];
            for (const consumer of consumers) {
                const { target, updater } = consumer;
                target.decorModel.unbind(receiver, updater);
            }
        }
        this.stateModel.commit()
    }

}