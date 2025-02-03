import { Value } from "@/types";

class EventProducer<E> {
    key!: string;
    target!: BaseModel;
}

type EventHandler<E> = (event: E) => void;

type BaseModel = Model< 
    Record<string, Value>,
    Record<string, BaseModel> | BaseModel[],
    Record<string, any>,
    BaseModel | undefined,
    Record<string, BaseModel | Readonly<BaseModel[]>>
>

type Reflect<T, K extends string> = T extends Record<string, any> ? T[K] : undefined;

class Model<
    S extends Record<string, Value>,
    C extends Record<string, BaseModel> | BaseModel[],
    E extends Record<string, any>,
    P extends BaseModel | undefined,
    R extends Record<string, BaseModel | Readonly<BaseModel[]>>
> {
    id!: string;
    state!: S;
    decor!: { [K in keyof S]: EventProducer<S[K]> };
    refer!: R;
    child!: C;
    event!: { [K in keyof E]: EventProducer<E[K]> };
    parent?: P;
    proxy!: {
        event: { [K in keyof E]: EventProducer<E[K]> };
        decor: { [K in keyof S]: EventProducer<S[K]> };
        child: C extends any[] ? 
            Reflect<C[number], 'proxy'> : 
            { [K in keyof C]: Reflect<C[K], 'proxy'> };
    }

    debug() {
        console.log(this.proxy)
    }

    protected static useEvent<E, M extends BaseModel>(
        eventLocator: (model: M) => EventProducer<E> | EventProducer<E>[] | undefined
    ) {
        return function(
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<EventHandler<E>>
        ): TypedPropertyDescriptor<EventHandler<E>> {
            return descriptor;
        };
    }
}

class ItemModel extends Model<
    { bar: string },
    { foo: ItemModel},
    { onPing: string, onPong: number },
    DemoModel,
    { next?: ItemModel }
> {

}

class DemoModel extends Model<
    { foo: string },
    ItemModel[],
    { onInit: void },
    BaseModel,
    {}
> {
    @Model.useEvent((model) => model.proxy.child.child.foo.child.foo.child.foo.event.onPong)
    private _onPong(data: number) {
        console.log('pong', data)
    }

    @Model.useEvent((model) => model.child.map(item => item.event.onPing))
    private _onPing(data: string) {
        console.log('ping', data)
    }

    @Model.useEvent((model) => model.event.onInit)
    private _onInit() {
        console.log('init')
    }
}