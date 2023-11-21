export type TextInputProps = {
    formText?: string, 
    valid?: boolean
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

export default function TextInput({ className, type, formText, valid, ...props}: TextInputProps) {
    className = className === undefined ? valid ?? true ? "form-control" : "form-control is-invalid" : (`${valid ?? true ? "form-control" : "form-control is-invalid"} ${className}`)
    type = type ?? "text";

    if(formText){
        return (
            <div className="input-group" style={{ flexDirection: "column" }}>
                <input {...props} spellCheck={false} className={className} type={type} style={{ ...props.style, width: "unset", borderTopRightRadius: "0.375rem", borderBottomRightRadius: "0.375rem" }} />
                <div style={{ marginBottom: "0" }} className="form-text">{formText}</div>
            </div>
        );
    }

    return <input {...props} spellCheck={false} className={className} type={type} />;
}