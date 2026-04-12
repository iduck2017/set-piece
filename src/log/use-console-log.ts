import { LogLevel, logService } from "./log-service";

export function useConsoleLog(level?: LogLevel) {
    return function(
        prototype: object,
        key: string,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => unknown>,
    ) {
        const method = descriptor.value;
        if (!method) return descriptor;
        descriptor.value = function(...args: any[]) {
            const _prevLevel = logService.level;
            const _nextLevel = level ?? LogLevel.INFO
            logService.level = Math.max(_prevLevel, _nextLevel);
            const result = method.apply(this, args);
            logService.level = _prevLevel;
            return result;
        }
        return descriptor;
    }
}


