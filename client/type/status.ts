
export enum AppStatus {
    /** 应用未初始化 */
    CREATED,
    /** 应用初始化完成,节点未挂载 */
    UNMOUNTED,
    /** 应用正在挂载节点 */
    MOUNTING,
    /** 应用已挂载节点 */
    MOUNTED,
    /** 应用正在卸载节点 */
    UNMOUNTING,
}


/**
 * 反序列化阶段
 * 1. 节点被创建 Inited
 * 2. 节点挂载到父节点 Binded
 * 3. 节点挂载到根节点 Mounted
 * 
 * 初始化阶段
 * 4. 节点业务逻辑执行 Activated
 * 5. 节点业务状态流转，例如生物成熟、生殖死亡
 * 6. 节点业务逻辑销毁 Deactivated 
 * 
 * 销毁阶段
 * 7. 节点卸载自根节点 Unmounted
 * 8. 节点卸载自父节点 Unbinded
 * 9. 节点销毁完成 Destroyed
 */
export enum ModelStatus {
    /** 节点未初始化 */
    CREATED,
    /** 节点挂载到父节点 */
    BINDED,
    /** 节点挂载到根节点 */
    MOUNTING,
    MOUNTED,
    /** 节点业务逻辑注销 */
    UNMOUNTING,
    UNMOUNTED,
    /** 节点销毁 */
    UNBINDED,
}
    