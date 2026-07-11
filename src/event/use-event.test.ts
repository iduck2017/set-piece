import { DiffEvent, Event } from ".";
import { useDep } from "../hooks/use-dep";
import { Model } from "../model";
import { useModel } from "../hooks/use-model";
import { useEventConsumer } from "../hooks/use-event-consumer";
import { useEventProducer } from "../hooks/use-event-producer";

class PingEvent extends Event {}
class CountChangedEvent extends DiffEvent<number> {}

@useModel('event-pinger')
class PingerModel extends Model {
    public ping() {
        this.emit(new PingEvent({}));
    }
}

@useModel('event-listener')
class ListenerModel extends Model {
    @useDep()
    private _pinger?: PingerModel;
    public get pinger() { return this._pinger; }
    public set pinger(value: PingerModel | undefined) { this._pinger = value; }

    private _pingCount = 0;
    public get pingCount() { return this._pingCount; }

    @useEventConsumer((self: ListenerModel) => [self.pinger, PingEvent])
    private handlePing(_event: PingEvent) {
        this._pingCount += 1;
    }
}

@useModel('event-counter')
class CounterModel extends Model {
    @useEventProducer(() => CountChangedEvent)
    @useDep()
    private _count = 0;
    public get count() { return this._count; }
    public set count(value: number) { this._count = value; }
}

@useModel('event-counter-listener')
class CounterListenerModel extends Model {
    @useDep()
    private _counter?: CounterModel;
    public get counter() { return this._counter; }
    public set counter(value: CounterModel | undefined) { this._counter = value; }

    private _values: number[] = [];
    public get values() { return this._values; }

    @useEventConsumer((self: CounterListenerModel) => [self.counter, CountChangedEvent])
    private handleCountChanged(event: CountChangedEvent) {
        this._values.push(event.detail.next);
    }
}

describe('event', () => {
    it('binds event consumers to dynamic producers', () => {
        const pingerA = new PingerModel();
        const pingerB = new PingerModel();
        const listener = new ListenerModel();

        listener.pinger = pingerA;
        pingerA.ping();
        pingerB.ping();
        expect(listener.pingCount).toBe(1);

        listener.pinger = pingerB;
        pingerA.ping();
        pingerB.ping();
        expect(listener.pingCount).toBe(2);
    });

    it('emits producer events when dep values change', () => {
        const counter = new CounterModel();
        const listener = new CounterListenerModel();

        listener.counter = counter;
        counter.count = 1;
        counter.count = 2;

        expect(listener.values).toEqual([1, 2]);
    });
});
