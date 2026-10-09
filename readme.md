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
  PrevEvent,
  Frame,
  DiffFrame,
  useModel,
  useStore,
  useDep,
  useState,
  useMemo,
  useEffect,
  useAnime,
  useChild,
  useRoute,
  useRef,
  useDecorConsumer,
  useDecorProducer,
  useEventConsumer,
  useEventProducer,
  useFrameConsumer,
  useFrameProducer,
  storeService,
} from 'set-piece';
```

`Event`、`Frame`、`Decor` 以及 `DiffEvent`、`PrevEvent`、`DiffFrame` 都是抽象基类。业务代码需要先继承出带业务语义的类型，再把这个业务类型用于 `emit`、producer 或 consumer。

## Tag

框架内部会给每个 `model + key` 创建稳定的 `Tag`：

```text
counter.count      -> Tag(counter, "count")
counter.total      -> Tag(counter, "total")
view.handleChange  -> Tag(view, "handleChange")
```

`Tag` 是依赖系统的最小单位。字段读取、memo 重算、consumer 重新绑定，最终都会记录为 tag 之间的关系。普通业务代码通常不需要直接操作 tag。

### 实现方式

框架使用 `WeakMap<Model, Map<string, Tag>>` 为每个实例字段缓存唯一的 `Tag`，再用以 `Tag` 为 key 的弱引用表保存字段值和各种依赖关系。装饰器、resolver 和 manager 之间不直接使用字符串定位状态，而是传递稳定的 `Tag` 对象。

### 模块职责

- `Tag`：表示一个稳定的 `model + key` 状态槽。
- `TagRegistry`：创建并缓存 model 字段对应的唯一 `Tag`。
- `TagDelegator`：以 `Tag` 为 key 保存装饰字段的底层值。

## Blink

`blink` 用于快速同步 dep 变化导致的计算值更新，并维护模型关系和 consumer 绑定。顺序是：

```text
modelResolver.resolve()
routeResolver.resolve()
memoResolver.resolve()
refResolver.resolve()
decorConsumerResolver.resolve()
eventConsumerResolver.resolve()
frameConsumerResolver.resolve()
```

多数情况下不需要手动使用 blink。`@useDep()` 写入、model 构造和 consumer 绑定等内部流程会自动进入 blink；需要显式建立同步收敛边界时，可以使用 `@useBlink()`。

### 实现方式

`useBlink` 用 `BlinkManager.launch()` 包装方法。manager 使用 `_pending` 合并嵌套 blink，最外层 handler 完成后，通过 `while (precheck())` 按固定顺序反复调用各 resolver，直到队列全部清空。整个循环期间 `_pending` 保持为 `true`，resolver 产生的新登记留在队列中，由尚未执行的 resolver 或下一轮处理；`resolve()` 自身不再包装 `useBlink`。模型构造结束后的刷新也通过 `launch()` 进入同一套循环。

### 模块职责

- `useBlink`：为方法建立可嵌套的同步收敛边界。
- `BlinkManager`：检查并按顺序协调所有 blink resolver。
- `ModelResolver`：初始化新创建的 model 或 view。
- `RouteResolver`：刷新 model 子树的 route 和 root。
- `MemoResolver`：失效和重算派生值。
- `RefResolver`：在 memo 更新后清除跨 root 的主动和被动 ref。
- `DecorConsumerResolver`：重新绑定 decor consumer。
- `EventConsumerResolver`：重新绑定 event consumer。
- `FrameConsumerResolver`：重新绑定 frame consumer。

## Action

`action` 用于合并同一批业务变化，依次执行 effect、decor 重算和变化通知。顺序是：

```text
effectResolver.resolve()
decorProducerResolver.resolve()
eventProducerResolver.resolve()
frameProducerResolver.resolve()
```

普通响应式写入会通过 blink 自动进入 action；需要把多次状态修改合并成一次副作用刷新时，可以用 `@useAction()` 包装业务方法。

### 实现方式

`useAction` 用 `ActionManager.launch()` 包装方法。manager 使用 `_pending` 合并嵌套 action，内层调用只执行 handler，最外层 handler 完成后通过 `precheck()` 检查是否有待处理任务，再依次处理 effect、decor producer、event producer 和 frame producer。`resolve()` 自身也包裹 `@useAction()`，因此一轮刷新期间新产生的 action 会复用当前边界；本轮结束后，若仍有任务，再进入下一轮，空队列时停止。`BlinkManager.launch()` 本身也接入 action，因此没有显式装饰器的单次字段写入仍会形成完整的 action 边界。

ref 校验在每次 blink 中完成，不等待外层 action 结束。decor 重算在 action 阶段完成，结果变化会同步触发 blink 更新相关 memo 和绑定；若又登记了 effect，则由后续 action 轮次处理。

### 模块职责

- `useAction`：把一次或多次状态修改包裹成统一的副作用边界。
- `ActionManager`：在 action 结束后依次处理 effect、decor producer、event producer 和 frame producer。
- `EffectResolver`：重新执行依赖发生变化的 effect。
- `DecorProducerResolver`：重新计算 decor producer 的最终结果。
- `EventProducerResolver`：把字段变化转换成 diff event。
- `FrameProducerResolver`：把字段变化转换成 diff frame。

## Model

所有业务对象都继承 `Model`。

```ts
@useStore('todo')
@useModel()
class TodoModel extends Model {
  @useDep()
  public title = '';
}
```

`@useModel()` 把构造流程接入 blink；`@useStore(code)` 单独登记持久化类型，要求构造函数支持无参调用。model 创建后不会在 constructor 里直接完成初始化，而是进入 `modelResolver`：

```text
new TodoModel()
  -> modelResolver.register(model)
  -> blink flush
  -> model._internal.init()
```

构造函数会将实例注册到 `finalizationRegistry`。随后初始化会做这些事情：

- 预热 memo getter
- 执行 effect 并收集依赖
- 绑定 decor consumer
- 绑定 event consumer
- 绑定 frame consumer

### 实现方式

`@useModel()` 先为原始类添加实例注册逻辑，再用 `BlinkManager.delegate()` 包装构造和注册的完整过程。需要持久化时，在它上方添加 `@useStore(code)`；装饰器自下而上执行，因此 `StoreRegistry` 登记的是包装后的构造函数，与实例的构造函数一致。继承链上的注册都发生在同一个构造 blink 内，由 `ModelResolver` 按实例去重；blink 收尾时调用 `_internal.init()`，统一预热 memo、执行初始 effect 并建立 decor、event、frame 的运行时绑定。

### 模块职责

- `Model`：提供 uuid、消息发送、初始化入口以及 parent、root、children 等模型树能力。
- `useModel`：包装模型构造过程，保留构造参数类型并接入初始化生命周期。
- `useStore`：登记 model code，要求 `Constructor<Model, undefined[]>`，返回原构造函数。
- `ModelResolver`：暂存新实例，在 blink 中调用模型初始化。
- `StoreRegistry`：维护 model code 与构造函数的双向映射。
- `finalizationRegistry`：使用 `FinalizationRegistry` 观察 model 被垃圾回收。

## Dep

`@useDep()` 标记一个可追踪字段。

```ts
@useStore('counter')
@useModel()
class CounterModel extends Model {
  @useDep()
  public count = 0;
}
```

字段被读取时，当前正在收集依赖的 consumer 会记录它。字段被写入时，框架会通知相关 resolver。

数组也会被代理，常见 mutation 会触发依赖更新：

```ts
@useDep()
public items: string[] = [];

this.items.push('a');
```

### 实现方式

`DepRegistry` 把字段改写为基于 `TagDelegator` 的 getter/setter：getter 向当前 `DepCollector` 报告读取，setter 包装数组、保存新值并调用 `DepService`。`DepService` 再把变更广播给 memo、effect、decor、event 和 frame 的 resolver；数组的原地 mutation 由 `DepDelegator` 的 Proxy 转换成同样的依赖通知。

### 模块职责

- `useDep`：把字段或 getter 登记为可追踪依赖。
- `DepRegistry`：安装响应式 getter/setter，并记录依赖字段元数据。
- `DepDelegator`：代理数组 mutation 和下标操作，向依赖系统报告原地修改。
- `DepCollector`：在 memo、effect 或 loader 执行期间临时收集被读取的 Tag。
- `DepManager`：保存 consumer→dependency 的反向依赖边。
- `DepConsumerManager`：保存 dependency→consumer 的正向依赖边，并提交收集结果。
- `DepService`：把一个字段变更分发给所有相关 resolver。

## State

`@useState()` 标记需要持久化的普通响应式状态，也可用于 decor producer 的原始值字段。它提供依赖追踪和存储字段注册，不会单独产生 decor、event 或 frame。仅使用 `@useDep()` 的字段不会自动保存。

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

### 实现方式

`useState` 同时调用 `DepRegistry.register()` 和 `StateRegistry.register()`。字段读写使用 dep getter/setter、依赖收集和变更分发流程；`StateRegistry` 记录字段 key，并沿构造函数继承链查询，供 `StoreService` 保存和恢复状态。

### 模块职责

- `useState`：把普通状态字段登记到依赖系统和持久化元数据中。
- `StateRegistry`：记录 state 字段 key，支持继承查询和去重。
- `DepRegistry`：复用与 `useDep` 相同的响应式字段实现。
- `DepService`：把 state 变化通知给 memo、effect 和各类 producer/consumer resolver。

## Store

`storeService.save(model)` 返回普通配置对象，`load(config)` 根据最外层的
`type` 创建模型，返回 `Model | undefined`。需要 JSON 字符串时，显式调用
`JSON.stringify()` 和 `JSON.parse()`。

| 字段装饰器 | 保存形式 | 恢复方式 |
| --- | --- | --- |
| `@useState()` | 字段原值 | 通过 setter 赋值 |
| `@useChild()` | 子模型配置或配置数组 | 递归创建模型并通过 setter 挂载 |
| `@useRef()` | UUID 或 UUID 数组 | 整棵树创建完成后查找实例并绑定 |

三种 registry 都支持继承字段。保存的 key 是装饰器所在的字段名，例如
`_title`，而不是公开 getter 的名字 `title`。普通字段、仅使用 `useDep`
的字段以及 memo 不会自动保存。

```ts
@useStore('store-item')
@useModel()
class ItemModel extends Model {
  @useState()
  private _title = '';
  public get title() { return this._title; }
  public set title(value: string) { this._title = value; }
}

@useStore('store-board')
@useModel()
class BoardModel extends Model {
  @useChild()
  private _items: ItemModel[] = [];
  public get items() { return this._items; }

  @useRef()
  private _selected?: ItemModel;
  public get selected() { return this._selected; }

  public add(item: ItemModel) {
    this._items.push(item);
    this._selected = item;
  }
}

const board = new BoardModel();
const item = new ItemModel();
item.title = 'Write docs';
board.add(item);

const config = storeService.save(board);
const json = JSON.stringify(config);
const restored = storeService.load(JSON.parse(json));

if (restored instanceof BoardModel) {
  restored !== board; // true
  restored.uuid === board.uuid; // true
  restored.items[0] !== item; // true
  restored.selected === restored.items[0]; // true
}
```

配置结构如下，UUID 以示例值表示：

```json
{
  "uuid": "board-1",
  "type": "store-board",
  "_items": [
    {
      "uuid": "item-1",
      "type": "store-item",
      "_title": "Write docs"
    }
  ],
  "_selected": "item-1"
}
```

### 实现方式

`load()` 在一个 blink 中完成两个阶段，单次调用只维护一个
`Map<string, Model>`：

1. `generate()` 根据 code 无参构造模型，恢复 UUID 和 state，递归恢复
   child。state 和 child 都通过 `Reflect.set()` 写入，保留响应式和挂载逻辑。
2. `bind()` 再遍历配置，通过 Map 解析 ref。此时所有持久化子模型都已创建，
   可以绑定父节点、兄弟节点、自身以及重复引用。

恢复完成后结束 blink，再统一进行初始化和依赖刷新。每次 `load()` 使用
独立的 Map，不会绑定到上一次加载的实例。

### 当前行为

- 模型及其子模型需要通过 `@useStore(code)` 注册，构造函数需支持无参调用；将 `@useStore(code)` 写在 `@useModel()` 上方。
- UUID 原样恢复。code 应保持唯一，同一份模型树配置中的 UUID 也应唯一。
- 最外层配置无效或类型未注册时，`load()` 返回 `undefined`。
  无效的子模型配置恢复为 `undefined`；这不是完整的 schema 校验。
- config 缺失的已注册字段会被赋为 `undefined`，覆盖构造默认值。
- ref 只解析本次生成的模型，找不到的 UUID 恢复为 `undefined`。
- child/ref 数组保留顺序、长度和空值位置。JSON 会把数组中的
  `undefined` 转成 `null`，加载时这些 child/ref 项恢复为 `undefined`。
- 空的单个 child 在保存时省略。state/ref 字段的 `undefined` 值会被
  `JSON.stringify()` 省略。
- state 按原值保存，不做深拷贝或特殊类型转换。JSON 存档应使用可被 JSON
  表达的数据；不会自动恢复 `Date`、`Map` 或其他自定义类实例。

### Copy

`Model.copy(): this | undefined` 复用 `save()` 和 `load()`，返回具体子类类型：

```ts
const copied = board.copy(); // BoardModel | undefined
if (copied) {
  copied !== board; // true
  copied.selected === copied.items[0]; // true
}
```

copy 创建新的模型和 child 实例，并把树内 ref 绑定到副本。它保留原 UUID，
不会生成新身份；state 中的对象和数组不会深拷贝，仍可能共享底层数据。
加载失败或产物不属于当前构造函数类型时返回 `undefined`。

### 模块职责

- `StoreRegistry`：维护 code 与最终包装后的模型构造函数的双向映射。
- `StateRegistry`：提供需要保存和恢复的 state 字段。
- `ChildRegistry`：提供 child 字段 key；保存时读取原字段以保留形状和空位。
- `RefRegistry`：提供最后绑定的 ref 字段。
- `StoreService`：协调保存、模型生成和引用绑定，不使用 entry registry
  或字段级 parser/generator。

## Memo

`@useMemo()` 标记 getter。框架会缓存 getter 结果，并自动收集 getter 读取过的依赖。

```ts
@useStore('counter')
@useModel()
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

### 实现方式

`MemoRegistry` 包装 getter，首次读取时开启依赖收集并把结果缓存在 `MemoDelegator`。依赖字段变化后，`MemoResolver` 根据依赖图找到受影响的 memo，解除旧依赖、清除缓存并重新读取 getter；只有新旧结果不同才继续通过 `DepService` 向下游传播。

### 模块职责

- `useMemo`：登记需要缓存的派生 getter。
- `MemoRegistry`：包装 getter、收集依赖并维护 memo 字段元数据。
- `MemoDelegator`：按 memo Tag 缓存派生结果。
- `memoManager`：保存 dependency→memo 的依赖关系。
- `MemoResolver`：在 blink 中失效、重算 memo，并传播真实的输出变化。

## Effect

`@useEffect()` 声明 action 阶段执行的副作用。

```ts
@useStore('counter')
@useModel()
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

### 实现方式

`EffectRegistry` 包装 effect 方法，每次执行前开启依赖收集。字段变化后，`EffectResolver` 从依赖图中找到受影响的方法，先解除旧依赖，再重新调用 effect 以收集新的动态依赖；`ActionManager` 保证这些调用发生在当前状态修改完成之后。

### 模块职责

- `useEffect`：登记响应式副作用方法。
- `EffectRegistry`：保存 effect 元数据并包装依赖收集逻辑。
- `effectManager`：保存 dependency→effect 的依赖关系。
- `EffectResolver`：在 action 阶段重绑依赖并重新执行受影响的 effect。
- `ActionManager`：合并嵌套 action，统一触发副作用阶段。

## Child

`@useChild()` 表示拥有关系。它会维护 `parent`、`root`、`children` 和 `descendants`。

```ts
@useStore('todo-list')
@useModel()
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

### 实现方式

`useChild` 为字段安装所有权 setter，并把数组交给 `ChildDelegator` 代理。单值替换或数组 mutation 会对移除项调用 `unmount()`、对新增项调用 `mount(parent)`；随后 parent、root、route 和整棵子树的派生状态通过 action/blink 自动刷新。

### 模块职责

- `useChild`：声明单个或数组形式的子模型所有权，并同时接入依赖系统。
- `ChildRegistry`：记录 child 字段及其子模型迭代器，供 `Model.children` 查询。
- `ChildDelegator`：代理数组 mutation，维护新增和移除模型的 mount/unmount。
- `Model.mount/unmount`：更新直接 parent，并登记 route 刷新。

## Route

`@useRoute()` 用来在当前 model 上保存某种祖先类型的引用。

```ts
@useStore('board')
@useModel()
class BoardModel extends Model {}

@useStore('card')
@useModel()
class CardModel extends Model {
  @useRoute(() => BoardModel)
  public readonly board?: BoardModel;
}
```

当 `CardModel` 被挂到某个 `BoardModel` 后，`card.board` 会指向最近的 `BoardModel` 祖先。挂载关系变化时，route 会进入 `routeResolver`，并在 blink 阶段统一刷新。

### 实现方式

`RouteRegistry` 保存字段对应的目标构造函数，并把 route 字段注册为依赖状态。mount/unmount 后，`RouteResolver` 暂存需要刷新的 model；blink 中的 `Model.reroute()` 从当前对象沿 parent 查找最近匹配实例，重新计算 root，再递归处理所有 children。

### 模块职责

- `useRoute`：声明字段需要引用的祖先模型类型。
- `RouteRegistry`：保存 route loader，并安装响应式字段。
- `RouteResolver`：合并需要 reroute 的 model，在 blink 中触发子树刷新。
- `Model.reroute`：计算 route、root，并向 descendants 传播树变化。

## Ref

`@useRef()` 表示普通引用关系，不是拥有关系。

```ts
@useStore('user')
@useModel()
class UserModel extends Model {}

@useStore('task')
@useModel()
class TaskModel extends Model {
  @useRef()
  public assignee?: UserModel;
}
```

`useRef` 会维护反向引用表。模型树发生 reroute 后，`RefResolver` 会在 action
结束时校验主动引用和被动引用；如果引用两端不再拥有相同的 `root`，单值 ref
会被设为 `undefined`，数组 ref 中对应的 model 会通过 `splice` 移除。

```text
useChild = ownership, updates parent/root/children
useRef   = reference, only tracks holders
```

### 实现方式

`useRef` 为字段安装引用 setter，并通过 `RefConsumerRegistry` 同时保存被引用 model 到持有字段 Tag 的反向关系。数组由 `RefDelegator` 代理，每次 mutation 都同步增加或删除一条 Tag；reroute 时 `RefResolver` 收集相关 model，在 action 末尾分别检查主动引用和被动引用，并用 `undefined` 或原数组 `splice()` 清除跨 root 的关系。

### 模块职责

- `useRef`：声明非所有权引用，并让引用字段同时具备依赖能力。
- `RefRegistry`：记录每种 model 声明的 ref 字段，用于主动引用检查。
- `RefConsumerRegistry`：以数组保存 referenced model→holder Tag 的反向引用，支持重复数组元素。
- `RefDelegator`：代理 ref 数组 mutation，同步维护反向引用记录。
- `RefResolver`：在 action 末尾清除 root 不同的单值和数组引用。

## Decor

`Decor<T>` 用来把一个原始值交给一组 consumer 修饰，最后把修饰后的结果作为属性读取值。框架只提供通用抽象基类，子类自行实现 `result` 和修改规则。下面的业务类提供 setter，允许 consumer 直接修改当前结果：

```ts
class AttackDecor extends Decor<number> {
  private _result = this._origin;
  public get result() { return this._result; }
  public set result(value: number) { this._result = value; }
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
    decor.result += this.value;
  }
}
```

decor producer 的原始值或 consumer 绑定变化时会进入 `decorProducerResolver`，在 action 阶段、effect 之后重算。decor consumer 的 loader 或 handler 依赖变化时会进入 `decorConsumerResolver`，在 blink 阶段重新绑定并登记 producer 重算。已有缓存的 decor 字段在 action 收尾前可能仍返回旧结果；无缓存时，getter 仍会直接计算。

### 实现方式

producer getter 会用原始值创建业务 `Decor`，由 `DecorService` 找到绑定的 consumer 并依次修改 decor，最终结果缓存在 `DecorProducerDelegator`。consumer loader 执行时会收集动态依赖，并由正反两个 manager 保存绑定；原始值或绑定变化后，两个 resolver 分别负责重算 producer 和重绑 consumer。

### 模块职责

- `Decor<T>`：承载原始值和目标 model，由子类实现最终结果与修改规则。
- `DecorProducerRegistry`：包装 producer 字段，创建 Decor、执行组合并登记 producer 类型。
- `DecorProducerDelegator`：缓存每个 producer Tag 的 decor 结果。
- `DecorProducerResolver`：定位失效 producer，清缓存重算，并传播最终结果变化。
- `DecorConsumerRegistry`：保存 consumer loader，并收集 loader 的动态依赖。
- `DecorConsumerManager`：保存 producer+Decor 类型→consumer Tag 的正向绑定。
- `DecorProducerManager`：保存 consumer Tag→producer+Decor 类型的反向绑定。
- `DecorConsumerResolver`：依赖变化后解除旧关系并重新运行 consumer loader。
- `DecorService`：建立/解除双向绑定，并把 Decor 派发给匹配的 consumer。

## Event

`Event` 适合表达业务事件。`emit` 只接收一个 event 实例，不再接收 options。

```ts
class PingEvent extends Event<{ message: string }> {}

this.emit(new PingEvent({ message: 'hello' }));
```

监听事件：

```ts
@useStore('ping')
@useModel()
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
class CountChangedEvent extends DiffEvent {}

@useStore('counter')
@useModel()
class CounterModel extends Model {
  @useEventProducer(() => CountChangedEvent)
  @useDep()
  public count = 0;
}
```

字段变化后，event producer 会在 action 阶段发出：

```ts
new CountChangedEvent()
```

`DiffEvent` 只通知字段发生变化，不携带旧值或新值；consumer 需要当前值时，从所订阅的 model 读取。

### 实现方式

consumer loader 在初始化和依赖变化时运行，正反两个 manager 保存 producer、Event 类型与 handler Tag 的绑定。`EventService` 根据 producer 和 event 构造函数找到 handler 并同步调用；字段 producer 则由 `EventProducerResolver` 在 action 末尾创建无载荷的 diff event 信号。显式 event 的派发边界由 Story 负责。

### 模块职责

- `Event/DiffEvent`：定义普通业务 event 和字段变化 event。
- `EventConsumerRegistry`：保存 consumer loader，并收集其动态依赖。
- `EventConsumerManager`：保存 producer+Event 类型→consumer Tag 的正向绑定。
- `EventProducerManager`：保存 consumer Tag→producer+Event 类型的反向绑定。
- `EventConsumerResolver`：依赖变化后重新绑定 consumer。
- `EventProducerRegistry`：记录字段 producer 对应的 DiffEvent 构造函数。
- `EventProducerResolver`：在 action 末尾把字段变化转换成 diff event。
- `EventService`：维护运行时绑定并同步调用匹配的 event handler。

## Story

`story` 是普通 event 的延后派发边界。普通 `Event` 会先进入队列，在最外层 story 的 handler 完成后统一派发；`PrevEvent` 表示必须立即处理的前置事件，会跳过队列同步派发。

```ts
class PingEvent extends Event<{ records: string[] }> {}
class BeforePingEvent extends PrevEvent<{ records: string[] }> {}

@useStory()
public ping(records: string[]) {
  this.emit(new PingEvent({ records }));
  this.emit(new BeforePingEvent({ records }));
  records.push('after emit');
}
```

### 实现方式

`useStory` 用 `EventResolver.launch()` 包装方法，嵌套 story 共享外层 `_pending` 和 event 队列。`Model.emit()` 遇到普通 Event 时调用 `EventResolver.register()`，最外层 handler 返回后按登记顺序交给 `EventService`；遇到 `PrevEvent` 时则直接调用 `EventService.emit()`。

### 模块职责

- `useStory`：为方法建立可嵌套的 event 延后派发边界。
- `EventResolver`：暂存普通 event，并在最外层 story 结束时按顺序派发。
- `PrevEvent`：表示跳过 story 队列、需要立即处理的前置 event。
- `EventService`：执行 story 最终派发或 PrevEvent 的即时派发。
- `Model.emit`：根据 Event 类型选择进入队列或立即派发。

## Frame

`Frame` 适合表达状态变化帧、动画帧或需要异步处理的消息。它和 Event 使用独立的类型与绑定表。

```ts
class CountFrame extends DiffFrame {}

this.emit(new CountFrame());
```

也可以用 `@useFrameProducer()` 把字段变化自动变成 frame：

```ts
@useStore('counter')
@useModel()
class CounterModel extends Model {
  @useFrameProducer(() => CountFrame)
  @useDep()
  public count = 0;
}
```

监听 frame：

```ts
class CounterViewModel extends Model {
  @useRef()
  public counter?: CounterModel;

  @useFrameConsumer((self: CounterViewModel) => [self.counter, CountFrame])
  private async handleCount(_frame: CountFrame) {
    console.log(this.counter?.count);
  }
}
```

`DiffFrame` 同样只发出无载荷信号；异步 consumer 读取 model 时，得到的是处理当时的状态。

frame consumer 的 loader 也会收集依赖；监听目标变化时会在 blink 阶段自动重绑。

### 实现方式

frame consumer loader 在初始化和依赖变化时运行，正反两个 manager 保存 producer、Frame 类型与 handler Tag 的绑定。`FrameService` 根据 producer 和 frame 构造函数找到 consumer，但不直接调用 handler，而是把任务登记到 Anime 的 `FrameResolver`；字段 producer 由 `FrameProducerResolver` 在 action 末尾创建无载荷的 diff frame 信号。

### 模块职责

- `Frame/DiffFrame`：定义普通 frame 和字段变化 frame。
- `FrameConsumerRegistry`：保存 consumer loader，并收集其动态依赖。
- `FrameConsumerManager`：保存 producer+Frame 类型→consumer Tag 的正向绑定。
- `FrameProducerManager`：保存 consumer Tag→producer+Frame 类型的反向绑定。
- `FrameConsumerResolver`：依赖变化后重新绑定 frame consumer。
- `FrameProducerRegistry`：记录字段 producer 对应的 DiffFrame 构造函数。
- `FrameProducerResolver`：在 action 末尾把字段变化转换成 frame。
- `FrameService`：维护运行时绑定，并把匹配 frame 加入派发队列。

## Anime

`anime` 是 frame 的分 step 派发边界。frame 会先登记到当前 step，最外层 anime 的 handler 完成后再按 step 顺序执行；同一步的异步 consumer 会并行运行，全部完成后才会进入下一步。

```ts
@useAnime()
public play() {
  this.emit(new CountFrame());
  frameResolver.proceed();
  this.emit(new CountFrame());
}
```

### 实现方式

`useAnime` 用 `FrameResolver.launch()` 包装方法，嵌套 anime 共用外层 `_pending`、step 和队列。`FrameService.emit()` 把每个 consumer Tag 与 frame 登记到当前 step；边界结束后，resolver 从低 step 到高 step 处理队列，并使用 `Promise.all` 等待当前 step 的所有 handler。

### 模块职责

- `useAnime`：为方法建立可嵌套的 frame 调度边界。
- `FrameResolver`：保存 step 队列，排序派发并等待异步 handler。
- `FrameResolver.proceed`：推进 step，使后续 frame 进入下一批次。
- `FrameService`：把匹配的 consumer Tag 和 frame 登记到当前 step。
- `Model.emit`：把 Frame 交给 `FrameService` 和 anime 调度链。

## View

视图类同样使用 `@useModel()` 接入 blink 初始化流程，构造函数可以带必填参数。

```ts
@useModel()
class CounterView extends Model {
  @useRef()
  public counter?: CounterModel;
}
```

它不会注册 model code，但会把构造函数交给 blink/modelResolver 初始化。

### 实现方式

`@useModel()` 将构造和实例登记包在同一个 blink 内，因此 view 可以使用 memo、effect、ref 和各种 consumer。只有添加 `@useStore(code)` 时，才向 `StoreRegistry` 登记持久化 code。

### 模块职责

- `useModel`：让视图类接入 Model 初始化生命周期。
- `BlinkManager`：合并 view 构造期间产生的依赖和绑定刷新。
- `ModelResolver`：在 blink 中初始化 view 的 memo、effect 和 consumers。

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
class TodoStatusEvent extends DiffEvent {}
class TodoDoneFrame extends DiffFrame {}

@useModel()
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

  @useFrameProducer(() => TodoDoneFrame)
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

@useModel()
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

  @useFrameConsumer((self: TodoListModel) => [self.todos, TodoDoneFrame])
  private async handleTodoFrame(_frame: TodoDoneFrame) {
    console.log('todo done changed');
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
