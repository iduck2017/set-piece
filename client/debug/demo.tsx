import React, { useEffect } from "react";
import { useModel } from "./use-model";
import { ModelComp } from ".";
import { Demo } from "@/model.bk/demo";
import { Ping } from "@/model.bk/ping";
import './index.css';
import { BunnyComp } from "./bunny";
import { PingsComp } from "./ping";
import { PongsComp } from "./pong";

export function DemoComp(props: {
    demo: Demo
}) {
    const { demo } = props;
    const [ state, child ] = useModel(demo);

    return <ModelComp 
        model={demo}
        form={
            <>
            </>
        }
        menu={
            <>
                {child.pings && <PingsComp pings={child.pings} />}
                {child.pongs && <PongsComp pongs={child.pongs} />}
                {child.bunny && <BunnyComp bunny={child.bunny} />}
            </>
        }
    />;
}
