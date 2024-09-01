
export enum AppStatus {
    /** 应用未初始化 */
    UNINITED,
    /** 应用初始化完成,节点未挂载 */
    UNMOUNTED,
    /** 应用正在挂载节点 */
    MOUNTING,
    /** 应用已挂载节点 */
    MOUNTED,
    /** 应用正在卸载节点 */
    UNMOUNTING,
}

export enum ModelStatus {
    /** 模型未建立连接 */
    UNMOUNTED,
    /** 模型正在建立连接,接入节点树 */
    MOUNTED,
    /** 模型初始化完成 */
    ACTIVATED,
    /** 模型断开连接并销毁 */
    DESTROYED,
}