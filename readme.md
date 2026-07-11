# set-piece

`set-piece` 是一个以 `Model` 为中心的 TypeScript 状态建模框架。它把普通对象组织成可追踪的模型树，并提供依赖收集、派生值、effect、decor、event、frame、父子关系、route 和 ref 等能力。

核心流程可以理解为：

```text
Model state changes
  -> dep tag is registered
  -> blink/action/story/anime boundaries collect work
  -> resolvers refresh memo, route, decor, event, frame, and effect
```

## Setup

项目使用 TypeScript decorator，需要开启：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}
```

常用导入：

```ts
import {
  Model,
  Decor,
  Event,
  DiffEvent,
  Frame,
  DiffFrame,
  useModel,
  useView,
  useDep,
  useState,
  useMemo,
  useEffect,
  useChild,
  useRoute,
  useRef,
  useDecorConsumer,
  useDecorProducer,
  useEventConsumer,
  useEventProducer,
  useFrameConsumer,
  useFrameProducer,
} from 'set-piece';
```

## Tag

框架内部会给每个 `model + key` 创建稳定的 `Tag`：

```text
counter.count      -> Tag(counter, "count")
counter.total      -> Tag(counter, "total")
view.handleChange  -> Tag(view, "handleChange")
```

`Tag` 是依赖系统的最小单位。字段读取、memo 重算、consumer 重新绑定，最终都会记录为 tag 之间的关系。普通业务代码通常不需要直接操作 tag。

## Lifecycle

`blink` 是同步收敛边界，负责刷新依赖图和绑定关系。顺序是：

```text
modelResolver.resolve()
routeResolver.resolve()
memoResolver.resolve()
decorProducerResolver.resolve()
decorConsumerResolver.resolve()
eventConsumerResolver.resolve()
frameConsumerResolver.resolve()
```

`action` 是用户状态修改后的副作用边界。顺序是：

```text
effectResolver.resolve()
eventProducerResolver.resolve()
frameProducerResolver.resolve()
```

`story` 是 event 的延后派发边界：

```text
eventResolver.resolve()
```

`anime` 是 frame 的派发边界：

```text
frameResolver.resolve()
```

多数情况下不需要手动使用这些边界。`@useDep()` 写入、model 构造、consumer 绑定等内部流程会自动进入对应边界。需要显式包裹业务方法时，可以使用 `@useAction()`、`@useBlink()`、`@useStory()` 或 `@useAnime()`。

## Model

所有业务对象都继承 `Model`。

```ts
@useModel('todo')
class TodoModel extends Model {
  @useDep()
  public title = '';
}
```

`@useModel(code)` 会注册模型类型，并把构造流程接入 blink。model 创建后不会在 constructor 里直接完成初始化，而是进入 `modelResolver`：

```text
new TodoModel()
  -> modelResolver.register(model)
  -> blink flush
  -> model._internal.init()
```

初始化会做这些事情：

- 注册到 `gcService`
- 预热 memo getter
- 执行 effect 并收集依赖
- 绑定 decor consumer
- 绑定 event consumer
- 绑定 frame consumer

## Dep And State

`@useDep()` 标记一个可追踪字段。

```ts
@useModel('counter')
class CounterModel extends Model {
  @useDep()
  public count = 0;
}
```

字段被读取时，当前正在收集依赖的 consumer 会记录它。字段被写入时，框架会通知相关 resolver。

数组和对象也会被代理，常见 mutation 会触发依赖更新：

```ts
@useDep()
public items: string[] = [];

this.items.push('a');
```

`@useState()` 是 decor producer 常用的 state 标记，本质上也会注册为依赖字段。

## Memo

`@useMemo()` 标记 getter。框架会缓存 getter 结果，并自动收集 getter 读取过的依赖。

```ts
@useModel('counter')
class CounterModel extends Model {
  @useDep()
  public count = 1;

  @useMemo()
  public get double() {
    return this.count * 2;
  }
}

const counter = new CounterModel();
counter.double; // 2

counter.count = 3;
counter.double; // 6
```

memo 的失效和重算发生在 blink 阶段。如果 memo 输出变化，它会继续通知依赖它的下游。

## Effect

`@useEffect()` 声明 action 阶段执行的副作用。

```ts
@useModel('counter')
class CounterModel extends Model {
  @useDep()
  public count = 0;

  public records: number[] = [];

  @useEffect()
  private record() {
    this.records.push(this.count);
  }
}
```

effect 会在 model 初始化时执行一次并收集依赖。之后相关依赖变化时，effect 会在 action 收尾阶段重新执行。

## Child

`@useChild()` 表示拥有关系。它会维护 `parent`、`root`、`children` 和 `descendants`。

```ts
@useModel('todo-list')
class TodoListModel extends Model {
  @useChild()
  public todos: TodoModel[] = [];
}

const list = new TodoListModel();
const todo = new TodoModel();

list.todos.push(todo);

todo.parent === list; // true
list.children;        // [todo]
```

child 字段同时也是依赖字段，因此 child 变化会触发 memo、route 和 consumer 绑定刷新。

## Route

`@useRoute()` 用来在当前 model 上保存某种祖先类型的引用。

```ts
@useModel('board')
class BoardModel extends Model {}

@useModel('card')
class CardModel extends Model {
  @useRoute(() => BoardModel)
  public readonly board?: BoardModel;
}
```

当 `CardModel` 被挂到某个 `BoardModel` 后，`card.board` 会指向最近的 `BoardModel` 祖先。挂载关系变化时，route 会进入 `routeResolver`，并在 blink 阶段统一刷新。

## Ref

`@useRef()` 表示普通引用关系，不是拥有关系。

```ts
@useModel('user')
class UserModel extends Model {}

@useModel('task')
class TaskModel extends Model {
  @useRef()
  public assignee?: UserModel;
}
```

`useRef` 会维护反向引用表。某个 model `unlink()` 时，引用它的 ref 字段会被清理，避免悬挂引用。

```text
useChild = ownership, updates parent/root/children
useRef   = reference, only tracks holders
```

## Decor

`Decor` 用来把一个原始值交给一组 consumer 修饰，最后把修饰后的结果作为属性读取值。

```ts
class AttackDecor extends Decor<number> {
  private _result: number;

  constructor(origin: number, target: Model) {
    super(origin, target);
    this._result = origin;
  }

  public get result() {
    return this._result;
  }

  public add(value: number) {
    this._result += value;
  }
}
```

生产 decor：

```ts
class MonsterModel extends Model {
  @useDecorProducer(() => AttackDecor)
  @useState()
  private _attack = 100;

  public get attack() {
    return this._attack;
  }
}
```

消费 decor：

```ts
class BuffModel extends Model {
  @useDep()
  public value = 10;

  @useDecorConsumer((self: BuffModel) => [self.target, AttackDecor])
  private handleAttack(decor: AttackDecor) {
    decor.add(this.value);
  }
}
```

decor producer 的值变化时会进入 `decorProducerResolver`。decor consumer 的 loader 依赖变化时会进入 `decorConsumerResolver`。两者都在 blink 阶段刷新。

## Event And Story

`Event` 适合表达业务事件。事件可以同步、延后或异步派发。延后事件会进入 `story` 边界，并在 story 结束时由 `eventResolver` 统一派发。

```ts
class PingEvent extends Event<{ message: string }> {}

this.emit(new PingEvent({ message: 'hello' }));
this.emit(new PingEvent({ message: 'later' }), { isDefer: true });
await this.emit(new PingEvent({ message: 'async' }), { isAsync: true });
```

监听事件：

```ts
@useModel('ping')
class PingModel extends Model {
  @useRef()
  public target?: PongModel;

  @useEventConsumer((self: PingModel) => [self.target, PingEvent])
  private handlePing(event: PingEvent) {
    this.target!.count += 1;
  }
}
```

consumer loader 会收集依赖。上面的 `self.target` 变化时，event consumer 会在 blink 阶段重新绑定。

也可以用 `@useEventProducer()` 把字段变化自动变成 event：

```ts
class CountChangedEvent extends DiffEvent<number> {}

@useModel('counter')
class CounterModel extends Model {
  @useEventProducer(() => CountChangedEvent)
  @useDep()
  public count = 0;
}
```

字段变化后，event producer 会在 action 阶段发出：

```ts
new CountChangedEvent({ next: this.count })
```

## Frame And Anime

`Frame` 类似 event，但它走 `anime` 边界和 `frameResolver` 调度，适合表达状态变化帧、动画帧或需要分 step 处理的消息。

```ts
class CountFrame extends Frame<{ next: number }> {}

this.emit(new CountFrame({ next: this.count }));
```

也可以用 `@useFrameProducer()` 把字段变化自动变成 frame：

```ts
@useModel('counter')
class CounterModel extends Model {
  @useFrameProducer(() => DiffFrame)
  @useDep()
  public count = 0;
}
```

监听 frame：

```ts
class CounterViewModel extends Model {
  @useRef()
  public counter?: CounterModel;

  @useFrameConsumer((self: CounterViewModel) => [self.counter, DiffFrame])
  private async handleCount(frame: DiffFrame<number>) {
    console.log(frame.detail.next);
  }
}
```

frame consumer 的 loader 也会收集依赖；监听目标变化时会在 blink 阶段自动重绑。

## View

`@useView()` 用于给非 store model 的视图类接入同样的 blink 初始化流程。

```ts
@useView()
class CounterView extends Model {
  @useRef()
  public counter?: CounterModel;
}
```

它不会注册 model code，但会把构造函数交给 blink/modelResolver 初始化。

## Complete Example

```ts
import {
  Model,
  Event,
  DiffEvent,
  DiffFrame,
  useModel,
  useDep,
  useMemo,
  useEffect,
  useChild,
  useEventConsumer,
  useEventProducer,
  useFrameProducer,
  useFrameConsumer,
} from 'set-piece';

class TodoDoneEvent extends Event<{ id: string }> {}
class TodoStatusEvent extends DiffEvent<string> {}

@useModel('todo')
class TodoModel extends Model {
  constructor(public readonly id: string, title: string) {
    super();
    this.title = title;
  }

  @useDep()
  public title = '';

  @useEventProducer(() => TodoStatusEvent)
  @useDep()
  public status = 'open';

  @useFrameProducer(() => DiffFrame)
  @useDep()
  public done = false;

  @useMemo()
  public get label() {
    return `${this.done ? '[x]' : '[ ]'} ${this.title}`;
  }

  public complete() {
    this.done = true;
    this.emit(new TodoDoneEvent({ id: this.id }));
  }
}

@useModel('todo-list')
class TodoListModel extends Model {
  @useChild()
  public todos: TodoModel[] = [];

  public doneIds: string[] = [];

  @useMemo()
  public get remaining() {
    return this.todos.filter(todo => !todo.done).length;
  }

  @useEventConsumer((self: TodoListModel) => [self.todos, TodoDoneEvent])
  private handleDone(event: TodoDoneEvent) {
    this.doneIds.push(event.detail.id);
  }

  @useFrameConsumer((self: TodoListModel) => [self.todos, DiffFrame])
  private async handleTodoFrame(frame: DiffFrame<boolean>) {
    console.log('todo done changed:', frame.detail.next);
  }

  @useEffect()
  private reportRemaining() {
    console.log('remaining:', this.remaining);
  }
}

const list = new TodoListModel();
const todo = new TodoModel('1', 'Write docs');

list.todos.push(todo);
todo.complete();
```
