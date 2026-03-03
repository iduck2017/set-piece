import { asChild } from "../child/as-child";
import { asCustomChild } from "../child/as-custom-child";
import { Model } from "../model";
import { Event } from "./event";
import { listenerRegistry } from "./listener";
import { onEmit } from "./on-emit";

class PingEvent extends Event {}
class PongEvent extends Event {}

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
        this.emitEvent(new PingEvent());
    }

    @onEmit(() => PongEvent)
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
        this.emitEvent(new PongEvent());
    }

    @onEmit(() => PingEvent)
    private handlePing(target: Model, event: PingEvent) {
        this._heartbeat += 1;
    }
}

describe('event', () => {
    const ping = new PingModel();
    const pong = new PongModel();
    const root = new RootModel();

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
        console.log(listenerRegistry.get(root));
        console.log(listenerRegistry.get(ping));
        console.log(listenerRegistry.get(pong));
        ping.run();
        expect(pong.heartbeat).toBe(1);
        pong.run();
        expect(ping.heartbeat).toBe(2);
    })
})