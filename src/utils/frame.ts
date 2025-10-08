import { Util } from ".";
import { Model } from "../model";
import { Method } from "../types";
import { Event, Handler, Producer } from "../types/event";
import { Props } from "../types/model";

export class FrameUtil<
    M extends Model = Model,
    E extends Props.E = Props.E,
>  extends Util {
    private static _time = 0;
    public static get time() { return FrameUtil._time; }
    public static add(value: number) { FrameUtil._time += value; }
    public static reset() { FrameUtil._time = 0; }
    
    public static bind<E extends Event, M extends Model>(
        producer: Producer<E, M>, 
        handler: Handler<E, M>
    ) {
        const model = producer.model;
        model.utils.event.bind(producer, handler);
        return () => FrameUtil.unbind(producer, handler)
    }

    public static unbind<E extends Event, M extends Model>(
        producer: Producer<E, M>, 
        handler: Handler<E, M>
    ) {
        const model = producer.model;
        model.utils.event.bind(producer, handler);
    }
}