import React from "react";
import { ModelComp } from ".";
import { Link } from "./common";
import { useModel } from "./use-model";
import { Pong, Pongs } from "@/model/pong";

export function PongsComp(props: {
    pongs: Pongs
}) {
    const { pongs } = props;
    const [ state, child ] = useModel(pongs);

    return <ModelComp
        model={pongs}
        form={
            <>
                <Link model={pongs} name="append" />
                <Link model={pongs} name="remove" />
            </>
        }
        menu={
            <>
                {child.map(item => (<PongComp key={item.uuid} pong={item} />))}
            </>
        }
    />;
}

export function PongComp(props: {
    pong: Pong
}) {
    const { pong } = props;
    const [ state, child ] = useModel(pong);

    return <ModelComp
        model={pong}
        form={
            <>
                <Link model={pong} name="trigger" />
            </>
        }
    />;
}