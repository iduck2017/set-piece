/* eslint-disable max-len */
import React, { ReactNode, useEffect, useState } from "react";
import "./index.css";
import { Model, ModelInfo } from "../model";
import { Base } from "../type";

export type VisibleInfo = {
    model: boolean;
    state: boolean;
    child: boolean;
    debug: boolean;
}

const FolderComp = (props: {
    title: keyof VisibleInfo;
    length: number;
    visibleDict: VisibleInfo,
    setVisibleDict: React.Dispatch<React.SetStateAction<VisibleInfo>>
    children?: ReactNode[];
}) => {
    const {
        title,
        length,
        visibleDict: visible,
        children,
        setVisibleDict: setVisible
    } = props;

    if (!length) return null;

    return <>
        <div className={`row ${visible[title] ? '' : 'fold'}`}>
            <div className="title key">{title}</div>
            <div className="value">({length})</div>
            <div 
                className="icon" 
                onClick={() => {
                    setVisible(prev => ({
                        ...prev,
                        [title]: !prev[title]
                    }));
                }}
            >
                {visible[title] ? '▴' : '▾'}
            </div>
        </div>
        {visible[title] && children}
    </>;
};

export function ModelComp(props: {
    model: Readonly<Model>,
}) {
    const { model } = props;
    const { app } = model;

    const [ info, setInfo ] = useState<ModelInfo>();
    const [ visible, setVisible ] = useState<VisibleInfo>({
        model: true,
        state: true,
        child: true,
        debug: true
    });
    
    const [ activedChild, setActivedChild ] = useState<Readonly<Model>>();

    const formatValue = (value: Base.Value) => {
        if (typeof value === 'string') return `"${value}"`;
        return `(${value})`;
    };

    useEffect(() => {
        if (!activedChild) return;
        const elem = document.getElementById(activedChild.id);
        if (elem) {
            elem.classList.add('actived');
            return () => elem.classList.remove('actived');
        }
    }, [ activedChild ]);

    // useEffect(() => {
    //     if (!activedSignal) return;
    //     for (const effectId of activedSignal.effectIdList) {
    //         const elem = document.getElementById(effectId);
    //         if (elem) {
    //             elem.classList.add('actived');
    //         }
    //     }
    //     return () => {
    //         for (const effectId of activedSignal.effectIdList) {
    //             const elem = document.getElementById(effectId);
    //             if (elem) {
    //                 elem.classList.remove('actived');
    //             }
    //         }
    //     };
    // }, [ activedSignal ]);

    // useEffect(() => {
    //     if (!activedEffect) return;
    //     for (const signalId of activedEffect.signalIdList) {
    //         const elem = document.getElementById(signalId);
    //         if (elem) {
    //             elem.classList.add('actived');
    //         }
    //     }
    //     return () => {
    //         for (const signalId of activedEffect.signalIdList) {
    //             const elem = document.getElementById(signalId);
    //             if (elem) {
    //                 elem.classList.remove('actived');
    //             }
    //         }
    //     };
    // }, [ activedEffect ]);

    useEffect(() => {
        return model.useInfo(setInfo);
    }, [ model ]);

    if (!info) return null;

    const {
        child,
        state,
        refer,
        debug
    } = info;

    return (
        <div className="model">
            <div className="body" id={model.id}>
                <div 
                    className={`head ${visible.model ? '' : 'fold'}`}
                    onClick={() => {
                        setVisible(prev => ({
                            ...prev,
                            model: !visible.model
                        }));
                    }}
                >
                    {model.code}
                </div>
                <div className={`row ${visible.model ? '' : 'fold'}`}>
                    <div className="title key">id</div>
                    <div className="value">
                        {formatValue(model.id)}
                    </div>
                </div>
                {visible.model && <>
                    <FolderComp
                        visibleDict={visible}
                        setVisibleDict={setVisible}
                        title="debug"
                        length={Object.keys(debug).length}
                    >
                        {Object.keys(debug).map(key => (
                            <div className="row" key={key}>
                                <div 
                                    className="key action"
                                    onClick={() => {
                                        debug[key].call(model);
                                    }}
                                >
                                    {key}
                                </div>
                            </div>
                        ))}
                    </FolderComp>
                    <FolderComp 
                        visibleDict={visible}
                        setVisibleDict={setVisible}
                        title="state"
                        length={Object.keys(state.raw).length}
                    >
                        {Object.keys(state.raw).map(key => (
                            <div 
                                className="row" 
                                key={key} 
                            >
                                <div className={`key link`}>
                                    {key}
                                </div>
                                <div className="value">
                                    {formatValue(state.cur[key])}
                                </div>
                            </div>
                        ))}
                    </FolderComp>
                    <FolderComp
                        visibleDict={visible}
                        setVisibleDict={setVisible}
                        title="child"
                        length={
                            Object.keys(child.dict).length + 
                            child.list.length}
                    >
                        {child.list.map((item, index) => (
                            <div 
                                className='row' 
                                key={index}
                            >
                                <div 
                                    className={`key link ${activedChild === item ? 'hover' : ''}`}
                                    onMouseEnter={() => setActivedChild(item)}
                                    onMouseLeave={() => setActivedChild(undefined)}
                                >
                                [{index}]
                                </div>
                            </div>
                        ))}
                        {Object.keys(child.dict).map(key => (
                            <div 
                                className='row'
                                key={key}
                            > 
                                <div 
                                    className={`key link ${activedChild === child.dict[key] ? 'hover' : ''}`}
                                    onMouseEnter={() => setActivedChild(child.dict[key])}
                                    onMouseLeave={() => setActivedChild(undefined)}
                                >
                                    {key}
                                </div>
                            </div>
                        ))}
                    </FolderComp>
                    {/* <FolderComp
                        visibleDict={visible}
                        setVisibleDict={setVisible}
                        title="signal"
                        length={Object.keys(signalDict).length}
                    >
                        {Object.keys(signalDict).map(key => (
                            <div 
                                id={signalDict[key].id}
                                className="row" 
                                key={key}
                            >
                                <div 
                                    className={`key link ${activedSignal === signalDict[key] ? 'hover' : ''}`}
                                    onMouseEnter={() => setActivedSignal(signalDict[key])}
                                    onMouseLeave={() => setActivedSignal(undefined)}
                                >
                                    {key}
                                </div>
                                <div className="value">{formatValue(signalDict[key].id)}</div>
                            </div>
                        ))}
                    </FolderComp> */}
                </>}
            </div>
            {visible.model && <div className="children">
                {child.list.map(item => (
                    <ModelComp 
                        key={item.id}
                        model={item}
                    />
                ))}
                {Object.values(child.dict).map(item => (
                    item ? <ModelComp 
                        key={item.id}
                        model={item}
                    /> : null
                ))}
            </div>}
        </div>
    );
}

