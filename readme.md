# set-piece

`set-piece` 是一个以 `Model` 为中心的 TypeScript 状态建模框架。它把普通对象组织成一棵可追踪的模型树，并提供响应式依赖、派生值、事件、帧消息、父子关系和路由查找等能力。

这个库的核心思想是：

```text
Model 上的字段变化
  -> 记录为依赖变更
  -> 在 blink/action/anime/story 边界中统一收敛
  -> 刷新 memo、effect、event/frame 绑定或派发消息
```

## 基础配置

项目使用装饰器 API，需要 TypeScript 开启：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}
```

典型导入：

```ts
import {
  Model,
  useModel,
  useDep,
  useMemo,
  useEffect,
  useChild,
  useRoute,
  useRef,
  Event,
  Frame,
  ChangeFrame,
  ChangeEvent,
  useEventConsumer,
  useEventProducer,
  useFrameConsumer,
  useFrameProducer,
  useView,
  Decor,
  useDecorConsumer,
  useDecorProducer,
  useState,
} from 'set-piece';
```

## 1. Tag：最底层的身份标记

框架内部会给每个 `model + key` 创建一个 `Tag`。

```text
someModel.count       -> Tag(someModel, "count")
someModel.total       -> Tag(someModel, "total")
someModel.handlePing  -> Tag(someModel, "handlePing")
```

`Tag` 是依赖系统的最小单位。一个字段被读取、一个 memo 被重算、一个 event consumer 需要重绑，最终都会落到 tag 之间的关系。

普通使用者通常不需要直接操作 `tagRegistry`。

## 2. Dep：可追踪字段

用 `@useDep()` 标记一个可追踪字段。

```ts
@useModel('counter')
class CounterModel extends Model {
  @useDep()
  public count = 0;
}
```

当 `count` 被读取时，当前正在收集依赖的 consumer 会记录它。

当 `count` 被写入时，框架会通知依赖系统：

```text
count changed
  -> memo/effect/eventConsumer/frameConsumer/frameProducer 等 resolver 收到 dep tag
```

数组也会被代理，常见 mutation 会触发依赖更新：

```ts
@useDep()
public items: string[] = [];

this.items.push('a'); // 会触发依赖更新
```

## 3. Memo：派生值

用 `@useMemo()` 标记 getter，框架会缓存它的结果，并自动收集它依赖了哪些 `@useDep()` 或其它 memo。

```ts
@useModel('counter')
class CounterModel extends Model {
  @useDep()
  public count = 1;

  @useMemo()
  public get double() {
    return this.count * 2;
  }

  @useMemo()
  public get label() {
    return `count=${this.count}, double=${this.double}`;
  }
}

const counter = new CounterModel();
counter.label; // "count=1, double=2"

counter.count = 3;
counter.label; // "count=3, double=6"
```

memo 的刷新发生在 `blink` 阶段。一次字段变化结束后，相关 memo 会被清缓存、重算，并继续通知下游 memo。

## 4. Blink：同步收敛边界

`blink` 是框架的同步响应式收敛层。

它主要负责：

```text
memoResolver.resolve()
eventConsumerResolver.resolve()
frameConsumerResolver.resolve()
modelResolver.resolve()
```

也就是说，blink 结束时会处理：

- memo 重算
- event consumer 重新绑定
- frame consumer 重新绑定
- model 初始化

用户可以用 `@useBlink()` 包裹方法，让方法结束后触发 blink 收敛：

```ts
class CounterModel extends Model {
  @useDep()
  public count = 0;

  @useBlink()
  public reset() {
    this.count = 0;
  }
}
```

多数情况下你不需要手动使用 `useBlink()`，因为 `@useDep()` 字段写入已经会进入 blink。

## 5. Action 和 Effect

`action` 是比 blink 更外层的动作边界。它现在主要负责 action 结束后的用户副作用：

```text
effectResolver.resolve()
frameProducerResolver.resolve()
```

用 `@useEffect()` 声明一个 effect：

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

effect 会在 model 初始化时执行一次，并收集依赖。之后依赖变化时，effect 会在 action 收尾阶段重新执行。

可以用 `@useAction()` 包裹业务方法：

```ts
class CounterModel extends Model {
  @useDep()
  public count = 0;

  @useAction()
  public increase() {
    this.count += 1;
  }
}
```

## 6. Model：模型实例和初始化

所有业务对象都继承 `Model`。

用 `@useModel(code)` 注册模型类型：

```ts
@useModel('todo')
class TodoModel extends Model {
  @useDep()
  public title = '';
}
```

创建 model 时，框架不会直接在 constructor 里同步初始化，而是注册到 `modelResolver`。初始化会在 blink 结束时执行：

```text
new TodoModel()
  -> modelResolver.register(model)
  -> blink resolve
  -> model._internal.init()
```

初始化会做这些事：

- 注册到 `gcService`
- 预热 memo
- 执行 effect，收集 effect 依赖
- 绑定 event consumer
- 绑定 frame consumer

## 7. Child：父子关系

`@useChild()` 表示拥有关系。它会让子 model 进入父 model 的 `children` 列表，并维护 `parent/root/descendants`。

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

`useChild` 同时也是 dep，所以 child 字段变化会触发 memo、consumer 绑定等刷新。

## 8. Route：向祖先查找模型

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

当 `CardModel` 被挂到某个 `BoardModel` 后，`card.board` 会指向最近的 `BoardModel` 祖先。挂载关系变化时，route 会重新计算。

## 9. Ref：非拥有引用

`@useRef()` 表示普通引用关系，不是父子关系。

```ts
@useModel('user')
class UserModel extends Model {}

@useModel('task')
class TaskModel extends Model {
  @useRef()
  public assignee?: UserModel;
}
```

`useRef` 会维护反向引用表。某个 model `unlink()` 时，引用它的 ref 字段会被清理，避免留下悬挂引用。

区别：

```text
useChild = 拥有关系，会影响 parent/root/children
useRef   = 普通引用，只负责断开引用
```

## 10. Event：同步、延后和异步事件

定义事件：

```ts
class PingEvent extends Event<{ message: string }> {}
```

发事件使用统一的 `emit()`：

```ts
this.emit(new PingEvent({ message: 'hello' }));
this.emit(new PingEvent({ message: 'later' }), { isDefer: true });
await this.emit(new PingEvent({ message: 'async' }), { isAsync: true });
```

监听事件用 `@useEventConsumer()`：

```ts
@useModel('pong')
class PongModel extends Model {
  public count = 0;
}

@useModel('ping')
class PingModel extends Model {
  @useDep()
  public target?: PongModel;

  public run() {
    this.emit(new PingEvent({ message: 'ping' }));
  }

  @useEventConsumer((self: PingModel) => [self.target, PingEvent])
  private handlePing(event: PingEvent) {
    this.target!.count += 1;
  }
}
```

consumer loader 会收集依赖。上面的 `self.target` 变化时，event consumer 会在 blink 阶段重新绑定到新的 target。

也可以用 `@useEventProducer()` 把字段变化自动变成 event：

```ts
class CountChangedEvent extends ChangeEvent<number> {}

@useModel('counter')
class CounterModel extends Model {
  @useEventProducer(() => CountChangedEvent)
  @useDep()
  public count = 0;
}
```

当 `count` 变化时，action 收尾阶段会自动发出：

```ts
new CountChangedEvent({ next: this.count })
```

## 11. Frame：按帧派发的消息

`Frame` 类似 event，但它走 `anime/frameResolver` 调度，适合表达状态变化帧、动画帧或需要分 step 处理的消息。

定义 frame：

```ts
class CountFrame extends Frame<{ next: number }> {}
```

手动发 frame：

```ts
this.emit(new CountFrame({ next: this.count }));
```

也可以用 `@useFrameProducer()` 把字段变化自动变成 frame：

```ts
@useModel('counter')
class CounterModel extends Model {
  @useFrameProducer(() => ChangeFrame)
  @useDep()
  public count = 0;
}
```

监听 frame：

```ts
class CounterViewModel extends Model {
  @useRef()
  public counter?: CounterModel;

  @useFrameConsumer((self: CounterViewModel) => [self.counter, ChangeFrame])
  private async handleCount(frame: ChangeFrame<number>) {
    console.log(frame.detail.next);
  }
}
```

和 event consumer 一样，frame consumer 的 loader 会收集依赖；监听目标变化时会自动重绑。

## 12. View

`@useView()` 用于给非 store model 的视图类接入同样的 blink 初始化流程。

```ts
@useView()
class CounterView extends Model {
  @useRef()
  public counter?: CounterModel;
}
```

它不会注册 model code，但会把构造函数交给 blink/modelResolver 初始化。

## 13. 完整示例

```ts
import {
  Model,
  Event,
  ChangeEvent,
  ChangeFrame,
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
class TodoStatusEvent extends ChangeEvent<string> {}

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

  @useFrameProducer(() => ChangeFrame)
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

  @useFrameConsumer((self: TodoListModel) => [self.todos, ChangeFrame])
  private async handleTodoFrame(frame: ChangeFrame<boolean>) {
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

## 14. Decor：可组合的值修饰

`decor` 用来把一个原始值交给一组 consumer 修饰，最后把修饰后的结果作为属性读取值。

定义一个 decor：

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
@useDecorProducer(() => AttackDecor)
@useState()
private _attack = 100;

public get attack() {
  return this._attack;
}
```

消费 decor：

```ts
@useDecorConsumer((self: MonsterModel) => [self, AttackDecor])
private handleAttack(decor: AttackDecor) {
  decor.add(this.buff);
}
```

当 `buff` 或 decor producer 相关依赖变化时，decor 会在 blink 阶段重新绑定和重算。

## 调度关系速记

```text
blink
  memo
  decor consumer binding
  decor producer
  event consumer binding
  frame consumer binding
  model init

action
  effect
  frame producer

story
  deferred event

anime
  frame dispatch
```

## 当前约定

`effect` 只属于 action，不再属于 blink。
