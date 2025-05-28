import { Define, Model } from "../model"
import { StateAgent } from "../agent/state";
import { WinstonModel } from "../demo/winston";

export namespace HumanDefine {

    export type P = HumanModel
    
    export type E = {
        onHello: HumanModel;
        onCount: number;
    }
  
    export type S = {
        nickname?: string;
        tags: string[];
        meta: { foo: string, bar: number }
        gender: boolean;
        name: string;
        age: number;
    }

    export type C = {
        cat?: PetModel
        dog: PetModel
        vice: HumanModel
        subordinates: HumanModel[]
    }

    export type R = {
        spouse?: HumanModel
        ancestor: HumanModel
        descendants: HumanModel[]
    }
    
}


export class HumanModel<
    P extends HumanDefine.P = HumanDefine.P,
    E extends Define.E & Partial<HumanDefine.E> = {},
    S extends Define.S & Partial<HumanDefine.S> = {},
    C extends Define.C & Partial<HumanDefine.C> = {},
    R extends Define.R & Partial<HumanDefine.R> = {},
> extends Model<P, 
    E & HumanDefine.E, 
    S & HumanDefine.S, 
    C & HumanDefine.C, 
    R & HumanDefine.R
> {

    public test() {
        
        this.event.onCount(3)
        this.event.onHello(this)
        // this.event.onHello(new WinstonModel())
        // this.event.onHello(new PetModel())

        const age: number = this.state.age
        const tags: ReadonlyArray<string> = this.state.tags
        const gender: boolean = this.state.gender
        const meta: { foo: string, bar: number } = this.state.meta
        // const _age: string = this.state.age
        // this.state.meta.foo = 'hello'
        // this.state.age = 2;
        // const aaa: number = this.state.aaa;

        this.draft.state.age = 2;
        this.draft.state.meta = { foo: 'hello', bar: 3 };
        this.draft.state.tags = [''];
        // this.draft.state.age = 'aaa';
        // this.draft.state.meta = 3;
        // this.draft.state.tags.push('');
        // this.draft.state.xxx = 3;

        
        const human: HumanModel = this;
        const cat: PetModel | undefined = this.child.cat;
        const dog: PetModel = this.child.dog;
        const vice: Readonly<HumanModel> = this.child.vice;
        const vice_2: HumanModel = human.child.vice;
        const subordinates: Readonly<HumanModel[]> = this.child.subordinates;
        const subordinate: HumanModel | undefined = this.child.subordinates[0]
        // const _dog: HumanModel | undefined = this.child.dog;
        // const _cat: HumanModel | undefined = this.child.cat;
        // const _subordinates: HumanModel[] = this.child.subordinates;
        // const _subordinates: Readonly<PetModel[]> = this.child.subordinates;

        delete this.draft.child.cat;
        this.draft.child.subordinates = [new WinstonModel()]
        this.draft.child.cat = new PetModel()
        this.draft.child.dog = new PetModel()
        this.draft.child.subordinates.push(new WinstonModel())
        this.draft.child.cat = new PetModel()
        // delete this.draft.child.dog;
        // this.draft.child.cat = new HumanModel()
        
        
        const ancestor: Readonly<HumanModel> | undefined = this.refer.ancestor
        const descendants: Readonly<HumanModel[]> | undefined = this.refer.descendants
        const spouse: Readonly<HumanModel> | undefined = this.refer.spouse
        // const _spouse: PetModel | undefined = this.refer.spouse
        // const _ancestor: PetModel | undefined = this.refer.ancestor
        // this.refer.ancestor?.push(new WinstonModel())

        delete this.draft.refer.spouse;
        this.draft.refer.spouse = new WinstonModel()
        this.draft.refer.ancestor = new WinstonModel()
        this.draft.refer.descendants = [new WinstonModel()]
        this.draft.refer.descendants.push(new WinstonModel())
        // this.draft.refer.ancestor = new PetModel()
        
        this.proxy.child.cat;
        this.proxy.child.dog;
        this.proxy.event.onChildChange;
        this.proxy.event.onHello;
        this.proxy.event.onStateChange;
        this.proxy.event.onReferChange;
        this.proxy.decor;
        human.proxy.child.subordinates.event.onChildChange;
        this.proxy.child.subordinates.event.onChildChange;
        human.proxy.child.subordinates.event.onHello;
        human.proxy.child.subordinates.child.cat?.event.onPlay;
        human.proxy.child.subordinates.child.dog.event.onPlay;
        
        this.parent?.hello();
        this.child.subordinates[0]?.hello();
    }


    @StateAgent.use(model => model.proxy.decor.meta)
    private CheckSelfState(target: HumanModel, state: { foo: string, bar: number }) {
        return { foo: 'hello', bar: state.bar + 1 };
    }

    @StateAgent.use(model => model.proxy.child.subordinates.decor.)
    private checkChildState(target: HumanModel, state: string | undefined) {
        return state
    }

    @StateAgent.use(model => model.proxy.child.subordinates.event.onHello)
    private handleHello(target: HumanModel, event: HumanModel) {
        console.log('handleHello', event);
    }

    // @StateAgent.use(model => model.proxy.child.subordinates.decor)
    // private handleSubordinatesState(target: HumanModel, state: Model.State<HumanModel>) {
    //     return {
    //         ...state,
    //         tags: [],
    //     };
    // }

    public hello() {}

    public static superProps<T extends HumanModel>(props?: Model.Props<T>) {
        const tags: string[] = ['world'];
        return {
            ...props,
            state: { 
                gender: true,
                name: 'world',
                age: 10,
                nickname: 'hello',
                tags,
                meta: { foo: 'hello', bar: 1 },
                ...props?.state 
            },
            child: { 
                cat: new PetModel(),
                dog: new PetModel(),
                subordinates: [],
                ...props?.child,
            },
            refer: {
                ancestor: new WinstonModel(),
                descendants: [],
                ...props?.refer,
            }
        }
    }
}



export class PetModel extends Model<HumanModel, { onPlay: void }, {}, { descendants?: PetModel[] }, {  }> {
    public play() {
        this.child.descendants?.[0]
    }

    constructor(props?: Model.Props<PetModel>) {
        super({
            ...props,
            state: { ...props?.state },
            refer: { ...props?.refer },
            child: { 
                descendants: [],                
                ...props?.child,
            },
        })
    }
}

