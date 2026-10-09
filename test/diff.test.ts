import { Model } from "../src/model";
import { DiffEvent } from "../src/event";
import { DiffFrame } from "../src/frame";
import { actionManager } from "../src/effect/action-manager";
import { frameResolver } from "../src/frame/frame-resolver";
import { useModel } from "../src/hooks/use-model";
import { useDep } from "../src/hooks/use-dep";
import { useEventProducer } from "../src/hooks/use-event-producer";
import { useEventConsumer } from "../src/hooks/use-event-consumer";
import { useFrameProducer } from "../src/hooks/use-frame-producer";
import { useFrameConsumer } from "../src/hooks/use-frame-consumer";

class ValueEvent extends DiffEvent<unknown> {}
class ValueFrame extends DiffFrame<unknown> {}

@useModel()
class DiffSource extends Model {
    @useEventProducer(() => ValueEvent)
    @useFrameProducer(() => ValueFrame)
    @useDep()
    public value: unknown = undefined;
}

@useModel()
class DiffListener extends Model {
    @useDep()
    public source?: DiffSource;

    public readonly events: ValueEvent['detail'][] = [];
    public readonly frames: ValueFrame['detail'][] = [];
    public onEvent?: (event: ValueEvent) => void;

    @useEventConsumer((self: DiffListener) => [self.source, ValueEvent])
    private handleEvent(event: ValueEvent) {
        this.events.push(event.detail);
        this.onEvent?.(event);
    }

    @useFrameConsumer((self: DiffListener) => [self.source, ValueFrame])
    private async handleFrame(frame: ValueFrame) {
        this.frames.push(frame.detail);
    }
}

function setup(value: unknown) {
    const source = new DiffSource();
    source.value = value;
    const listener = new DiffListener();
    listener.source = source;
    return { source, listener };
}

describe('diff payloads', () => {
    it('keeps the first previous value and emits the final value per batch', () => {
        const { source, listener } = setup(1);
        actionManager.launch(() => {
            source.value = 2;
            source.value = 3;
        });
        source.value = 4;

        const expected = [{ prev: 1, next: 3 }, { prev: 3, next: 4 }];
        expect(listener.events).toEqual(expected);
        expect(listener.frames).toEqual(expected);
    });

    it('does not overwrite an undefined previous value', () => {
        const { source, listener } = setup(undefined);
        actionManager.launch(() => {
            source.value = 1;
            source.value = 2;
        });

        expect(listener.events).toEqual([{ prev: undefined, next: 2 }]);
        expect(listener.frames).toEqual([{ prev: undefined, next: 2 }]);
    });

    it('snapshots arrays across repeated in-place operations and later batches', () => {
        const { source, listener } = setup([1, 2]);
        const values = source.value as number[];
        actionManager.launch(() => {
            values.push(3);
            values.splice(0, 1, 9);
            values[1] = 8;
            delete values[2];
        });
        const next = [9, 8, 3];
        delete next[2];
        expect(listener.events).toEqual([{ prev: [1, 2], next }]);
        expect(listener.frames).toEqual([{ prev: [1, 2], next }]);

        values.push(4);
        expect(listener.events[0]).toEqual({ prev: [1, 2], next });
        expect(listener.frames[0]).toEqual({ prev: [1, 2], next });
        expect(listener.events[1]).toEqual({ prev: next, next: values });
        expect(listener.frames[1]).toEqual({ prev: next, next: values });
    });

    it('preserves an old array after replacement even if its original alias mutates', () => {
        const original = [1];
        const { source, listener } = setup(original);
        actionManager.launch(() => {
            source.value = [2];
            original.push(9);
            (source.value as number[]).push(3);
        });

        expect(listener.events).toEqual([{ prev: [1], next: [2, 3] }]);
        expect(listener.frames).toEqual([{ prev: [1], next: [2, 3] }]);
    });

    it('starts a new event batch for writes made by an event handler', () => {
        const { source, listener } = setup(1);
        listener.onEvent = event => {
            if (event.detail.next === 2) source.value = 3;
        };
        source.value = 2;

        expect(listener.events).toEqual([{ prev: 1, next: 2 }, { prev: 2, next: 3 }]);
        // Frame producers flush after event producers, so they combine both writes.
        expect(listener.frames).toEqual([{ prev: 1, next: 3 }]);
    });

    it('keeps frame array payloads stable until delayed delivery', async () => {
        const { source, listener } = setup([1]);
        const values = source.value as number[];
        let release!: () => void;
        const pending = frameResolver.launch(() => new Promise<void>(resolve => {
            release = resolve;
        }));
        values.push(2);
        values.push(3);
        expect(listener.frames).toEqual([]);

        release();
        await pending;
        expect(listener.frames).toEqual([
            { prev: [1], next: [1, 2] },
            { prev: [1, 2], next: [1, 2, 3] },
        ]);
    });
});
