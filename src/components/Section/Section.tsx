import React from "react";
import "./Section.css";

export type SectionProps = {
    children: React.ReactNode,
    wide?: boolean,
    forceMaxHeight?: boolean
}

export default function Section(props: SectionProps){
    return (
        <div className={`section${props.wide ? " wide" : ""}${props.forceMaxHeight ? " force-max-height" : ""}`}>
            {props.children}
        </div>
    );
}