import "./Button.css";

export type ButtonColor = (
    "green" |
    "red"
)

export type ButtonProps = {
    label: string, 
    color: ButtonColor, 
    wide?: boolean
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

export default function Button({ className, type, label, color, wide, ...props }: ButtonProps){
    className = `btn${wide ? " btn-wide" : ""} btn-${color ?? "green"}`;
    type = type ?? "button";

    return (
        <button {...props} className={className} type={type}>
            {label}
        </button>
    );
}