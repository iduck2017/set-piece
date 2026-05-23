import { Event } from "./event";
import { Model } from "./model";
import { useModel } from "./use-model";
import { useChild } from "./child/use-child";
import { Frame } from "./frame";
import { Decor } from "./decor";
import { useRoute } from "./route/route-registry";
import { useEventConsumer } from "./event/use-event-consumer";
import { useFrameConsumer } from "./frame/use-frame-consumer";
import { useDecorProducer } from "./decor/use-decor-producer";
import { useDecorConsumer } from "./decor/use-decor-consumer";
import { useMemo } from "./memo/use-memo";
import { useRef } from "./ref/use-ref";

class PingEvent extends Event {}
class PongEvent extends Event {}

class PingFrame extends Frame {}
class PongFrame extends Frame {}

class PingDecor extends Decor<number> {
    public add() {
        this._origin += 1;
    }
    public get result() {
        return this._origin;
    }
}
class PongDecor extends Decor<number> {
    public add() {
        this._origin += 1;
    }
    public get result() {
        return this._origin;
    }
}

@useModel('root')
class RootModel extends Model {

    @useChild()
    public ping?: PingModel;

    @useChild()
    public pong?: PongModel;
}


@useModel('pong')
class PongModel extends Model {
    
    @useDecorProducer(() => PongDecor)
    public value: number = 1;


    // @useRoute(() => RootModel)
    // protected _game?: RootModel;
    // @useMemo()
    // protected get ping() {
    //     return this._game?.ping;
    // }

    @useRef()
    public ping?: PingModel;

    @useEventConsumer((that) => [that.ping, PingEvent])
    protected _handlePing(event: PingEvent) {
        console.log('ping')
    }

    @useFrameConsumer((that) => [that.ping, PingFrame])
    protected async _handlePingFrame(event: PingFrame) {
        alert('ping')
    }

    @useDecorConsumer((that) => [that.ping, PingDecor])
    protected _handlePingDecor(decor: PingDecor) {
        decor.add();
    }

    public launch() {
        this.emitEvent(new PongEvent({}))
        this.emitFrame(new PongFrame({}))
    }
}

@useModel('ping')
class PingModel extends Model {

    @useDecorProducer(() => PingDecor)
    public value: number = 1;

    @useRef()
    public pong?: PongModel;

    // @useRoute(() => RootModel)
    // protected _game?: RootModel;
    // @useMemo()
    // protected get pong() {
    //     return this._game?.pong;
    // }


    @useEventConsumer((that) => [that.pong, PongEvent])
    protected _handlePing(event: PongEvent) {
        console.log('pong')
    }

    @useFrameConsumer((that) => [that.pong, PongFrame])
    protected async _handlePingFrame(event: PongFrame) {
        alert('pong')
    }
    
    @useDecorConsumer((that) => [that.pong, PongDecor])
    protected _handlePingDecor(decor: PongDecor) {
        decor.add();
    }

    public launch() {
        this.emitEvent(new PingEvent({}))
    }
}


const global: any = window

// const root = new RootModel()
// global.root = root;
// root.ping = new PingModel()
// root.pong = new PongModel()
// root.ping.launch();
// root.pong.launch()
// console.log(root.ping.value);
// console.log(root.pong.value)
// root.ping = undefined;
// console.log(root.pong.value);

let ping: PingModel | undefined = new PingModel() // act as view
let pong = new PongModel() // act as model
ping.pong = pong;
pong.launch()
ping.destroy();
ping = undefined;
pong.launch()