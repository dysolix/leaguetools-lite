import React from "react";
import "./Text.css";

export default function Text(props: React.PropsWithChildren<{ align?: "left" | "center" | "right" }>){
    return (
        <div className={`text ${props.align ?? "center"}`}>
            {props.children}
        </div>
    )
}