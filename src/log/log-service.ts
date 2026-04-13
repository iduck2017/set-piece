export enum LogLevel {
    INFO,
    WARN,
    ERROR,
}

export class LogService {
    public level: LogLevel = LogLevel.INFO;

    constructor() {
        const that = this;
        global.console = new Proxy(console, {
            get(origin, key) {
                const value: unknown = Reflect.get(origin, key)
                if (
                    value === origin.log ||
                    value === origin.group ||
                    value === origin.info ||
                    value === origin.debug ||
                    value === origin.trace
                ) return that.log(value, LogLevel.INFO);
                if (value === origin.warn) return that.log(value, LogLevel.WARN);
                if (value === origin.error) return that.log(value, LogLevel.ERROR);
                return value;
            }
        })
    }

    private log(handler: unknown, level: LogLevel) {
        return (...args: any[]) => {
            if (this.level > level) return;
            if (!(handler instanceof Function)) return;
            handler.apply(console, args);
        }
    }

}
export const logService = new LogService();