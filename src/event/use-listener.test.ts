import { useChild } from "../child/use-child";
import { useCustomChild } from "../child/use-custom-child";
import { Model } from "../model";
import { domainContext, domainRegistry } from "../route/domain";
import { Event } from ".";
import { listenerContext } from "./listener";
import { listenerRegistry, useListener } from "./use-listener";

class PingEvent extends Event {
}
class PongEvent extends Event {
    private bar: number = 2
}

class RootModel extends Model {
    @useChild()
    private _ping?: PingModel;
    
    @useChild()
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

    @useListener(() => [PongEvent, RootModel, Model])
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

    @useListener(() => [PingEvent, RootModel, Model])
    private handlePing(target: Model, event: PingEvent) {
        this._heartbeat += 1;
    }
}

describe('event', () => {
    const ping = new PingModel();
    const pong = new PongModel();
    const root = new RootModel();
    console.log('EventRegistry', listenerRegistry)
    console.log('Prev ListenerRegistry root', listenerContext.get(root))
    console.log('Prev ListenerRegistry ping', listenerContext.get(ping))
    console.log('Prev ListenerRegistry pong', listenerContext.get(pong))

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
        console.log('Next ListenerRegistry root', listenerContext.get(root));
        console.log('Next ListenerRegistry ping', listenerContext.get(ping));
        console.log('Next ListenerRegistry pong', listenerContext.get(pong));
        ping.run();
        expect(pong.heartbeat).toBe(1);
        pong.run();
        expect(ping.heartbeat).toBe(2);
    })
})