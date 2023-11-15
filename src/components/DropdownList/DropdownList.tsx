export type DropdownListProps = {
    label: string, 
    value: any, 
    children: any,
    disabled?: boolean,
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void,
}

export default function DropdownList(props: DropdownListProps) {
    return (
        <div className="form-floating">
            <select value={props.value} disabled={props.disabled} className="form-select" onChange={ev => props.onChange(ev)}>
                {props.children}
            </select>
            <label>{props.label}</label>
        </div>
    );
}