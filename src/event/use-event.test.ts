import { ChangeEvent, Event } from ".";
import { useDep } from "../dep/dep-registry";
import { Model, useModel } from "../model";
import { useEventConsumer } from "./event-consumer-registry";
import { useEventProducer } from "./event-producer-resolver";

class PingEvent extends Event {}
class CountChangedEvent extends ChangeEvent<number> {}

@useModel('event-pinger')
class PingerModel extends Model {
    public ping() {
        this.emit(new PingEvent({}));
    }
}

@useModel('event-listener')
class ListenerModel extends Model {
    @useDep()
    public pinger?: PingerModel;

    public pingCount = 0;

    @useEventConsumer((self: ListenerModel) => [self.pinger, PingEvent])
    private handlePing(_event: PingEvent) {
        this.pingCount += 1;
    }
}

@useModel('event-counter')
class CounterModel extends Model {
    @useEventProducer(() => CountChangedEvent)
    @useDep()
    public count = 0;
}

@useModel('event-counter-listener')
class CounterListenerModel extends Model {
    @useDep()
    public counter?: CounterModel;

    public values: number[] = [];

    @useEventConsumer((self: CounterListenerModel) => [self.counter, CountChangedEvent])
    private handleCountChanged(event: CountChangedEvent) {
        this.values.push(event.detail.next);
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
