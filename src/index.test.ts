import { Model } from "./model";
import { Computer } from "./types/decor";
import { EventUtil, Producer } from "./utils/event";
import { StateUtil } from "./utils/state";
import { TemplUtil } from "./utils/templ";

class EmptyModel extends Model {
    // constructor(props?: EmptyModel['props']) {
    //     super({
    //         uuid: props?.uuid,
    //         state: { foo: 3, ...props?.state },
    //         child: { foo: new EmptyModel(), ...props?.child },
    //         refer: { foo: new EmptyModel(), ...props?.refer }
    //     })
    // }

    // invalid() {
    //     this.state.aaa;
    //     this.child.aaa;
    //     this.refer.aaa;
    //     this.event.aaa;
    //     this.origin.state.aaa;
    //     this.origin.child.aaa;
    //     this.origin.refer.aaa;
    //     this.proxy.child.aaa;
    //     this.proxy.event.aaa;
    // }

    debug() {}
}

// new EmptyModel({
//     uuid: '',
//     state: { foo: 3 },
//     child: { foo: new EmptyModel() },
//     refer: { foo: new EmptyModel() }
// })

export namespace AnimalModel {
    export type E = { onBorn: { time: string }}
    export type S = { age: number }
    export type C = {
        item: AnimalModel,
        list: AnimalModel[]
    }
    export type R = {
        item: AnimalModel,
        list: AnimalModel[]
    }
}

export class AnimalModel<
    E extends Model.E & Partial<AnimalModel.E> = {},
    S extends Model.S & Partial<AnimalModel.S> = {},
    C extends Model.C & Partial<AnimalModel.C> = {},
    R extends Model.R & Partial<AnimalModel.R> = {}
> extends Model<
    E & AnimalModel.E,
    S & AnimalModel.S,
    C & AnimalModel.C,
    R & AnimalModel.R
> {
    constructor(props: AnimalModel['props'] & {
        state: S,
        child: C,
        refer: R & AnimalModel.R
    }) {
        super({
            uuid: props.uuid,
            state: { 
                age: 3, 
                name: "John", // ignored error
                ...props.state 
            },
            child: { 
                item: new DogModel(),
                list: [new DogModel()],
                ...props.child,
            },
            refer: {
                ...props.refer,
            },
        });
    }

    valid() {
        const age: number = this.state.age;
        const cItem: AnimalModel = this.child.item;
        const rItem: AnimalModel | undefined = this.refer.item;
        const cList: Readonly<AnimalModel[]> = this.child.list;
        const rList: Readonly<AnimalModel[]> | undefined = this.refer.list;

        this.origin.state.age = 3;
        this.origin.child.item = new DogModel();
        this.origin.child.list.push(new DogModel());
        this.origin.refer.item = new DogModel();
        this.origin.refer.list?.push(new DogModel());

        this.event.onBorn({ time: "2025-01-01" });

        this.route.parent;
        this.route.root;
        this.route.list;
    }

    // @EventUtil.on((self) => self.onBornB)
    // @EventUtil.on((self) => self.onBornC)
    // @EventUtil.on((self) => self.onBornD)
    @EventUtil.on((self) => self.onBorn)
    listen() {
        if (Math.random() > 0.5) return undefined;
        const self: AnimalModel = this;
        return self.proxy.event?.onBorn;
    }

    @EventUtil.if()
    @StateUtil.if()
    check() {
        return this.origin.state.age > 18;
    }

    onBorn(that: AnimalModel, event: { time: string }) {}
    onBornB(that: EmptyModel, event: { time: string  }) {}
    onBornC(that: DogModel, event: { time: string }) {}
    onBornD(that: EmptyModel, event: { time: string, name: string, count: number }) {}


    @StateUtil.on((self) => self.onCompute)
    modify() {
        const self: AnimalModel = this;
        return self.proxy.decor;
        // return this.proxy.child.kin.decor;
    }

    onCompute(that: AnimalModel, decor?: AnimalModel['decor']) {
        const age: number | undefined = decor?.result.age;
    }

    // invalid() {
    //     const age: string = this.state.age;
    //     const cItem: EmptyModel = this.child.item;
    //     const rItem: AnimalModel = this.refer.item;
    //     const cList: AnimalModel = this.child.list;
    //     const rList: AnimalModel[] = this.refer.list;
        
    //     this.state.age = 3;
    //     this.child.item = new DogModel();
    //     this.child.list.push(new DogModel()); 
    //     this.refer.item = new DogModel(); 
    //     this.refer.list?.push(new DogModel());

    //     this.event.onBorn({ time: 3 });
    // }
}


export namespace DogModel {
    export type E = { onPlay: { time: string, name: string } };
    export type S = { price: number, name: string }
    export type C = { kin: DogModel }
    export type R = { kin: DogModel }
}

@TemplUtil.is('dog')
export class DogModel extends AnimalModel<
    DogModel.E,
    DogModel.S,
    DogModel.C,
    DogModel.R
> { 
    constructor(props?: DogModel['props']) {
        super({
            uuid: props?.uuid,
            state: {
                age: 3,
                name: "John",
                price: 100,
                // gender: "male",
                ...props?.state,
            },
            child: {
                kin: new DogModel(),
                ...props?.child,
            },
            refer: {
                kin: new DogModel(),
                item: new DogModel(),
                list: [new DogModel()],
                ...props?.refer,
            }
        });
    }

    valid() {
        const age: number = this.state.age;
        const cItem: AnimalModel = this.child.item;
        const rItem: AnimalModel | undefined = this.refer.item;
        const cList: Readonly<AnimalModel[]> = this.child.list;
        const rList: Readonly<AnimalModel[]> | undefined = this.refer.list;
        const name: string = this.state.name;
        const cKin: DogModel = this.child.kin;
        const rKin: DogModel | undefined = this.refer.kin;

        this.origin.state.age = 3;
        this.origin.child.item = new DogModel();
        this.origin.child.list.push(new DogModel());
        this.origin.refer.item = new DogModel();
        this.origin.refer.list?.push(new DogModel());

        this.event.onBorn({ time: "2025-01-01" });
        this.event.onPlay({ time: "2025-01-01", name: "John" });
    }

    // @EventUtil.on((self) => self.onPlayB)
    // @EventUtil.on((self) => self.onPlayC)
    // @EventUtil.on((self) => self.onPlayD)
    @EventUtil.on((self) => self.onPlay)
    listen() {
        return this.proxy.child.kin.event?.onPlay;
    }

    @EventUtil.if()
    @StateUtil.if()
    check() {
        return this.origin.state.age > 18;
    }

    onPlay(that: DogModel, event: { time: string, name: string }) {}
    onPlayB(that: EmptyModel, event: { time: string, name: string }) {}
    onPlayC(that: DogModel, event: { time: string }) {}
    onPlayD(that: EmptyModel, event: { time: string, name: string, count: number }) {}


    @StateUtil.on((self) => self.onCompute)
    modify() {
        const self: DogModel = this;
        return self.proxy.decor;
        // return this.proxy.child.kin.decor;
    }

    onCompute(that: DogModel, decor?: DogModel['decor']) {
        const age: number | undefined = decor?.result.age;
    }


    // invalid() {
    //     const age: string = this.state.age;
    //     const cItem: EmptyModel = this.child.item;
    //     const rItem: AnimalModel = this.refer.item;
    //     const cList: Readonly<EmptyModel[]> = this.child.list;
    //     const rList: Readonly<AnimalModel[]> = this.refer.list;
        
    //     this.state.age = 3;
    //     this.child.item = new DogModel();
    //     this.child.list.push(new DogModel()); 
    //     this.refer.item = new DogModel(); 
    //     this.refer.list?.push(new DogModel());

    //     this.event.onBorn({ time: 3 });
    //     this.event.onPlay({ time: "2025-01-01" });
    // }
}

