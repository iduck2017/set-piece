import { Event } from ".";
import { depManager } from "../dep/dep-manager";
import { useDep } from "../dep/use-dep";
import { Model } from "../model";
import { fieldRegistry } from "../utils/field-registry";
import { eventManager } from "./event-manager";
import { eventConsumerManager } from "./event-consumer-manager";
import { useEvent } from "./use-event";

class PingEvent extends Event {
    protected _brand = Symbol('ping-event')
}
class PongEvent extends Event {
    protected _brand = Symbol('pong-event')
}

class PingModel extends Model {
    protected _brand = Symbol('ping-model')
    constructor() {
        super();
        this.init();
    }

    public count = 0;

    @useDep()
    public _pong?: PongModel;

    public run() {
        this.emit(new PingEvent());
    }

    @useEvent((i) => [i._pong, PongEvent])
    private handlePong(event: PongEvent) {
        this.count += 1;
    }
}

class PongModel extends Model {
    protected _brand = Symbol('pong-model')
    constructor() {
        super();
        this.init();
    }

    public count = 0;


    @useDep()
    public _ping?: PingModel;

    public run() {
        this.emit(new PongEvent());
    }

    @useEvent((i) => [i._ping, PingEvent])
    private handlePing(event: PingEvent) {
        this.count += 1;
    }
}


describe('useEvent', () => {
    const ping = new PingModel();
    const pong = new PongModel();
    it('should work', () => {
        const dep = fieldRegistry.query(ping, 'handlePong');
        ping._pong = pong;
        pong._ping = ping;
        expect(pong.count).toBe(0);
        expect(ping.count).toBe(0);
        ping.run();
        expect(pong.count).toBe(1);
        pong.run();
        expect(ping.count).toBe(1);
    });

    it('unbind ping-pong', () => {
        ping._pong = undefined;
        pong.run();
        expect(ping.count).toBe(1);
        ping.run()
        expect(pong.count).toBe(2);
        pong._ping = undefined;
        ping.run();
        expect(pong.count).toBe(2);
    });
});