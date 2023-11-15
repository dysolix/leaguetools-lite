import "./Toggle.css";

export type ToggleProps = {
    label: string, 
    state: boolean, 
    setState: (state: boolean) => void, 
    disabled?: boolean,
    tooltip?: string
}

export default function Toggle(props: ToggleProps) {
    return (
        <div className="form-check form-switch center">
            <input disabled={props.disabled} checked={props.state} className="form-check-input" type="checkbox" onChange={ev => props.setState(ev.target.checked)} />
            <label className="form-check-label" title={props.tooltip}>{props.label}</label>
        </div>
    )
}