import React from "react";
import { ModelComp } from ".";
import { Link } from "./common";
import { useModel } from "./use-model";
import { Ping, Pings } from "@/model/ping";

export function PingsComp(props: {
    pings: Pings
}) {
    const { pings } = props;
    const [ state, child ] = useModel(pings);

    return <ModelComp
        model={pings}
        form={
            <>
                <Link model={pings} name="append" />
                <Link model={pings} name="remove" />
            </>
        }
        menu={
            <>
                {child.map(item => (<PingComp key={item.uuid} ping={item} />))}
            </>
        }
    />;
}

export function PingComp(props: {
    ping: Ping
}) {
    const { ping } = props;
    const [ state, child ] = useModel(ping);

    return <ModelComp
        model={ping}
        form={
            <>
                <Link model={ping} name="trigger" />
            </>
        }
    />;
}