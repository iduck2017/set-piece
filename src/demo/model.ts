import { Define, Model } from "src/model";
import { DeepReadonly, Mutable } from "utility-types";

// export namespace Define {
//     export type E = Record<string, any>;
//     export type S = Record<string, any>;
//     export type R = Record<string, Model | Model[]>;
//     export type C = Record<string, Model | Model[]>;
// }

// export class Model<
//     P extends Model = any,
//     E extends Define.E = {},
//     S extends Define.S = {},
//     C extends Define.C = {},
//     R extends Define.R = {},
// > {
//     public readonly child!: Readonly<{ [K in keyof C]: C[K] extends any[] ? Readonly<C[K]> : C[K] }>;

//     public readonly refer!: Readonly<{ [K in keyof R]: R[K] extends any[] ? Readonly<R[K]> : R[K] }>;

//     public readonly state!: DeepReadonly<S>;

//     public readonly event!: Readonly<{ [K in keyof E]: (event: E[K]) => void }>

//     protected readonly draft!: Readonly<{
//         child: C,
//         state: S,
//         refer: R
//     }>

// }

export namespace AnimalDefine {
    export type E = { onHello: AnimalModel, onSleep: void, onCount: number }
    export type S = { gender: boolean, age: number, readonly name: string; id?: string, position:  { x: number, y: number }, tags: string[] }
    export type C = { foo: AnimalModel, bar: AnimalModel[], baz?: AnimalModel, zig?: AnimalModel[], readonly zag: AnimalModel }
    export type R = { foo: AnimalModel, bar: AnimalModel[], baz?: AnimalModel, zig?: AnimalModel[], readonly zag: AnimalModel }
}


class AnimalModel<
    E extends Define.E & Partial<AnimalDefine.E> = {},
    S extends Define.S & Partial<AnimalDefine.S> = {},
    C extends Define.C & Partial<AnimalDefine.C> = {},
    R extends Define.R & Partial<AnimalDefine.R> = {}
> extends Model<
    Model,
    E & AnimalDefine.E,
    S & AnimalDefine.S,
    C & AnimalDefine.C,
    R & AnimalDefine.R
> {
    test() {
        const bar: Readonly<AnimalModel[]> = this.child.bar;
        const fooo: string = this.child.foo;
        const foo: Readonly<AnimalModel> = this.child.foo;
        foo.test();
        const zig: Readonly<AnimalModel[]> | undefined = this.child.zig;
        const baz: Readonly<AnimalModel> | undefined = this.child.baz;
        const xxx: AnimalModel = this.child.xxx;

        const bar_2: Readonly<string[]> = this.child.bar;
        const foo_2: string = this.child.foo;
        const zig_2: Readonly<string[]> | undefined = this.child.zig;
        const baz_2: string | undefined = this.child.baz;

        const bar_3: AnimalModel[] = this.draft.child.bar;
        const foo_3: AnimalModel = this.draft.child.foo;
        const zig_3: AnimalModel[] = this.draft.child.zig;
        const baz_3: AnimalModel | undefined = this.draft.child.baz;

        this.child.bar.push(new AnimalModel());
        this.child.foo = new AnimalModel();

        this.draft.child.xxx;
        this.draft.child.bar.push(new AnimalModel());
        this.draft.child.bar = [new AnimalModel()];
        this.draft.child.foo = new AnimalModel();
        this.draft.child.baz = new AnimalModel();
        this.draft.child.zig?.push(new AnimalModel());
        this.draft.child.zig = [new AnimalModel()];
        this.draft.child.zag = new AnimalModel();
        this.draft.child.baz = 23;


        const age: number = this.state.age;
        const name: string = this.state.name;
        const gender: boolean = this.state.gender;
        const xxx: string = this.state.xxx;
        const position: Readonly<{ x: number, y: number }> = this.state.position;
        this.state.position.x = 3;
        const y: number = this.state.position.y;
        const tags: Readonly<string[]> = this.state.tags;
        const id: string | undefined = this.state.id;

        this.draft.state.age += 1;
        this.draft.state.age += 'aaa';
        this.draft.state.gender = true;
        this.draft.state.gender = 'aaa';

        delete this.draft.state.id;
        delete this.draft.state.xxx;
        delete this.draft.state.age;
        this.draft.state.id = 'aaa';
        this.draft.state.position.x = 3;
        this.draft.state.position = { x: 3, y: 4 };

        this.draft.state.tags.push('aaa');
        this.draft.state.tags = ['aa']
        this.draft.state.name = 'zig';

        this.event.onCount(123);
        this.event.onHello(this);
        this.event.onSleep(undefined);
        this.event.onHello(3);
        this.event.onHello(new AnimalModel());


        this.refer.bar[0]?.test();
        this.refer.baz?.test();
        this.refer.zig?.[0]?.test();
        this.refer.zag.test();
        const zag: Readonly<AnimalModel> = this.refer.zag;
        const zag_2: Readonly<AnimalModel> = this.refer.zag;
        this.refer.zag.test();
        const zag_3: string = this.refer.zag;
    }
}
