import { asChild } from "../child/as-child";
import { asCustomChild } from "../child/as-custom-child";
import { Model } from "../model";
import { domainMapHistory, domainRegistry } from "../route/domain";
import { Event } from "./event";
import { eventListenerRegistry } from "./listener";
import { eventRegistry, onEmit } from "./on-emit";

class PingEvent extends Event {
}
class PongEvent extends Event {
    private bar: number = 2
}

class RootModel extends Model {
    @asChild()
    private _ping?: PingModel;
    
    @asChild()
    private _pong?: PongModel;

    public bindPingPong(ping: PingModel, pong: PongModel) {
        console.log('bindPingPong', ping, pong);
        this._ping = ping;
        this._pong = pong;
    }
}

class PingModel extends Model {
    private _heartbeat = 1;
    public get heartbeat() {
        return this._heartbeat;
    }
    public run() {
        this.emit(new PingEvent());
    }

    @onEmit(() => [PongEvent, RootModel])
    private handlePong(target: Model, event: PongEvent) {
        this._heartbeat *= 2;
    }
}

class PongModel extends Model {
    private _heartbeat = 0;
    public get heartbeat() {
        return this._heartbeat;
    }
    public run() {
        this.emit(new PongEvent());
    }

    @onEmit(() => [PingEvent, RootModel])
    private handlePing(target: Model, event: PingEvent) {
        this._heartbeat += 1;
    }
}

describe('event', () => {
    const ping = new PingModel();
    const pong = new PongModel();
    const root = new RootModel();
    console.log('EventRegistry', eventRegistry)
    console.log('Prev ListenerRegistry root', eventListenerRegistry.get(root))
    console.log('Prev ListenerRegistry ping', eventListenerRegistry.get(ping))
    console.log('Prev ListenerRegistry pong', eventListenerRegistry.get(pong))

    it('check-initial-status', () => {
        expect(ping.heartbeat).toBe(1);
        expect(pong.heartbeat).toBe(0);
    })

    it('ineffective-event', () => {
        ping.run();
        expect(pong.heartbeat).toBe(0);
        pong.run();
        expect(ping.heartbeat).toBe(1);
    })

    it('bind-ping-pong', () => {
        root.bindPingPong(ping, pong);
        console.log('Next ListenerRegistry root', eventListenerRegistry.get(root));
        console.log('Next ListenerRegistry ping', eventListenerRegistry.get(ping));
        console.log('Next ListenerRegistry pong', eventListenerRegistry.get(pong));
        ping.run();
        expect(pong.heartbeat).toBe(1);
        pong.run();
        expect(ping.heartbeat).toBe(2);
    })
})