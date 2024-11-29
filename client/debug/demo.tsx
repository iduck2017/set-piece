import React, { useEffect } from "react";
import './index.css';
import { App } from "@/model/app";
import { useModel } from "./use-model";
import { ModelComp } from ".";
import { Link } from "./common";
import { Demo } from "@/model/demo";
import { Bunny } from "@/model/bunny";
import { ListComp } from "./list";
import { Ping } from "@/model/ping-pong";

export function DemoComp(props: {
    demo: Demo
}) {
    const { demo } = props;
    const [ state, child ] = useModel(demo);

    useEffect(() => {
        // app.init();
    }, []);

    return <ModelComp 
        model={demo}
        form={
            <>
            </>
        }
        menu={
            <>
                {child.pings && <ListComp 
                    list={child.pings} 
                    args={{
                        code: 'ping'
                    }}
                    render={(item) => <PingComp ping={item} />} 
                />}
                {child.bunny && <BunnyComp bunny={child.bunny} />}
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
    />;
}

export function BunnyComp(props: {
    bunny: Bunny
}) {
    const { bunny } = props;
    const [ state, child ] = useModel(bunny);

    return <ModelComp 
        model={bunny}
        form={
            <>
                <Link model={bunny} name="reproduce" />
                <Link model={bunny} name="growup" />
            </>
        }
        menu={
            <>
                {child.map(item => (<BunnyComp key={item.uuid} bunny={item} />))}
            </>
        }
    />;
}