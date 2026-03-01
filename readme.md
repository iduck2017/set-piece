复刻一些策略游戏的逻辑，需要抽象的一些模型

模型层

标记child，自动绑定parent，触发route的计算，序列化和反序列化，reload
支持const，array

_child
get: const获取值，array则获取proxy
set: 包装route操作

标记state，compute和reload，序列化和反序列化

事务 推迟reload和event执行

event由全局管理事件，handler中对target作单独校验


标记refer，用于垃圾回收，
垃圾回收 unmount child会被视为一次gc


业务层

生命周期

