// 应用状态机
export enum AppStatus {
    CREATED,    // 初始化
    UNMOUNTED,  // 未挂载
    MOUNTING,   // 挂载中
    MOUNTED,    // 已挂载
    UNMOUNTING, // 卸载中
}

