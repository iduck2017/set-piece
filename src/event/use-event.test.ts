import { Event } from ".";
import { depManager } from "../dep/dep-manager";
import { useDep } from "../dep/use-dep";
import { Model } from "../model";
import { useModel } from "../use-model";
import { eventConsumerManager } from "./event-consumer-manager";
import { useEventConsumer } from "./use-event-consumer";

class PingEvent extends Event {
    protected _brand = Symbol('ping-event')
}
class PongEvent extends Event {
    protected _brand = Symbol('pong-event')
}

@useModel('ping')
class PingModel extends Model {
    protected _brand = Symbol('ping-model')

    public count = 0;

    @useDep()
    public _pong?: PongModel;

    public run() {
        this.emitEvent(new PingEvent());
    }

    @useEventConsumer((i) => [i._pong, PongEvent])
    private handlePong(event: PongEvent) {
        console.log('HandlePong')
        this.count += 1;
    }
}

@useModel('pong')
class PongModel extends Model {
    protected _brand = Symbol('pong-model')

    public count = 0;


    @useDep()
    public _ping?: PingModel;

    public run() {
        this.emitEvent(new PongEvent());
    }

    @useEventConsumer((i) => [i._ping, PingEvent])
    private handlePing(event: PingEvent) {
        console.log('HandlePing');
        this.count += 1;
    }
}


const ping = new PingModel();
const pongA = new PongModel();
const pongB = new PongModel();

ping._pong = pongA;
pongA._ping = ping;


ping.run();
pongA.run();
pongB.run();

ping._pong = pongB;

pongA.run();
pongB.run();



// describe('useEvent', () => {
//     it('should work', () => {
//         const dep = fieldRegistry.query(ping, 'handlePong');
//         ping._pong = pong;
//         pong._ping = ping;
//         expect(pong.count).toBe(0);
//         expect(ping.count).toBe(0);
//         ping.run();
//         expect(pong.count).toBe(1);
//         pong.run();
//         expect(ping.count).toBe(1);
//     });

//     it('unbind ping-pong', () => {
//         ping._pong = undefined;
//         pong.run();
//         expect(ping.count).toBe(1);
//         ping.run()
//         expect(pong.count).toBe(2);
//         pong._ping = undefined;
//         ping.run();
//         expect(pong.count).toBe(2);
//     });
// });