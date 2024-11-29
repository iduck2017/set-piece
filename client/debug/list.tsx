import React, { ReactNode, useEffect } from "react";
import './index.css';
import { App } from "@/model/app";
import { useModel } from "./use-model";
import { ModelComp } from ".";
import { Link } from "./common";
import { Pings } from "@/model/list";
import { Model } from "@/model";

export function ListComp<M extends Model>(props: {
    list: Pings<M>,
    render: (item: M) => ReactNode,
    args: Parameters<Pings<M>['append']>[0]
}) {
    const { list, render, args } = props;
    const [ state, child ] = useModel(list);

    const pop = () => {
        if (list.child.length) {
            const child = list.child[list.child.length - 1];
            list.remove(child);
        }
    };

    return <ModelComp 
        model={list}
        form={
            <>
                <Link model={list} name="append" args={[ args ]} />
                <div className="link" onClick={pop}>pop</div>
            </>
        }
        menu={
            <>
                {child.map(render)}
            </>
        }
    />;
}