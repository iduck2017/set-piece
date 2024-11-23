import { Bunny, Gender } from "@/model/bunny";
import React from "react";
import './index.css';
import { useModel } from "./useModel";

export function BunnyComp(props: {
    target: Bunny
}) {
    const { target: bunny } = props;
    const [ state, child ] = useModel(bunny);

    return <div className="menu">
        <div className="form">
            <div className="title">{bunny.type}</div>
            <div>id: {bunny.id}</div>
            <div>age: {state.age}</div>
            <div>maxAge: {state.maxAge}</div>
            <div>gender: {state.gender}</div>
            <div>warm: {state.warm}</div>
            <div>isAlive: {state.isAlive.toString()}</div>
            <div className="link" onClick={() => bunny.debug()}>debug</div>
            {Boolean(child.bunnies.length) && <>
                <div className="link" onClick={() => bunny.clean()}>clean</div>
            </>}
            {state.isAlive && <> 
                <div className="link" onClick={() => bunny.growup()}>growup</div>
                {state.gender === Gender.Female && <>
                    <div className="link" onClick={() => bunny.reproduce()}>reproduce</div>
                </>}
            </>}
        </div>
        <div className="menu">
            {child.bunnies && (
                child.bunnies.map(bunny => <BunnyComp key={bunny.id} target={bunny} />)
            )}
        </div>
    </div>;
}