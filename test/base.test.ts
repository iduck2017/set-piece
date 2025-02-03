import { Event } from '@/types';
import { Model } from '../src/model';

@Model.useRoot()
class DemoModel extends Model<{
    count: number;
}, {
    onPing: Event<{ count: number }>
}, FooModel[]> {
    constructor(props: DemoModel['props']) {
        super({
            state: {
                count: props.state?.count ?? 0
            },
            child: []
        });
    }

    test() {
        const foo = this.childAgent
        foo.child.bar;
    }
    
    @Model.useFiber()
    countFiberic() {
        this.stateProxy.count++;
        return this.state.count;
    }

    count() {
        this.stateProxy.count++;
        return this.state.count;
    }

    @Model.useFiber()
    countTwiceUseless() {
        this.stateProxy.count++;
        this.stateProxy.count++;
    }

    @Model.useFiber()
    countTwiceFiberic() {
        this.setState(prev => ({ count: prev.count + 1 }));
        this.setState(prev => ({ count: prev.count + 1 }));
    }

    countTwice() {
        this.stateProxy.count++;
        this.stateProxy.count++;
        return this.state.count;
    }

    spawn() {
        this.childProxy.push(new FooModel({}));
        return this.child.length;
    }

    @Model.useFiber()
    spawnFiberic() {
        this.childProxy.push(new FooModel({}));
        return this.child.length;
    }

    @Model.useFiber()
    spawnTwiceFiberic() {
        this.childProxy.push(new FooModel({}));
        this.childProxy.push(new FooModel({}));
        return this.child.length;
    }

    ping() {
        this.emitEvent(this.event.onPing, { count: this.state.count });
    }
}


class FooModel extends Model<{
    flag: boolean;
}, {}, {
    bar?: BarModel
}, DemoModel> {
    constructor(props: FooModel['props']) {
        super({
            state: {
                flag: props.state?.flag ?? false
            },
            child: {}
        });
    }

    test() {
        this.childAgent?.bar
    }

    @Model.useEvent((model) => model.parent?.event.onPing)
    _onParentCheck(e: { count: number }) {
        console.log(e);
        this.stateProxy.flag = true;
    }

    // @Model.useDecor((model) => model.parent)
    // _onParentCheck(prevState: DemoModel['state']) {
    //     return { ...prevState, count: prevState.count + 1 };
    // }
}

class BarModel extends Model<{
    name: string;
}, {}, {}, FooModel> {
    constructor(props: BarModel['props']) {
        super({
            state: {
                name: props.state?.name ?? ''
            },
            child: {}
        });
    }
}

describe('set-piece', () => {

  describe('state-operation', () => {
    test('count-fiberic', () => {
        const model = new DemoModel({});
        const resule = model.countFiberic();
        expect(resule).toBe(0);
    });
    
    test('count', () => {
        const model = new DemoModel({});
        const result = model.count();
        expect(result).toBe(1);
    });

    test('count-twice-useless', () => {
        const model = new DemoModel({});
        model.countTwiceUseless();
        const result = model.state.count;
        expect(result).toBe(1);
    });

    test('count-twice-fiberic', () => {
        const model = new DemoModel({});
        model.countTwiceFiberic();
        const result = model.state.count;
        expect(result).toBe(2);
    });


    test('count-twice', () => {
        const model = new DemoModel({});
        const result = model.countTwice();
        expect(result).toBe(2);
    });

  });

  describe('child-operation', () => {
    test('spawn', () => {
        const model = new DemoModel({});
        const result = model.spawn();
        expect(result).toBe(1);
    });

    test('spawn-fiberic', () => {
        const model = new DemoModel({});
        const result = model.spawnFiberic();
        expect(result).toBe(0);
    });

    test('spawn-twice-fiberic', () => {
        const model = new DemoModel({});
        const result = model.spawnTwiceFiberic();
        const result_2 = model.child.length;
        expect(result).toBe(0);
        expect(result_2).toBe(2);
    });
  });

  describe('event-operation', () => {
    test('ping', () => {
        const model = new DemoModel({});
        model.spawn();
        model.ping();
        const foo = model.child[0];
        expect(foo.state.flag).toBe(true);
    });

    test('before-ping', () => {
        const model = new DemoModel({});
        model.spawn();
        const foo = model.child[0];
        expect(foo.state.flag).toBe(false);
    });
  });

});