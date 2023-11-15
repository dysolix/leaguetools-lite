import Button, { ButtonProps } from "../Button/Button";
import TextInput, { TextInputProps } from "../TextInput/TextInput";

export type TextInputWithButtonProps = {
    textInput: TextInputProps,
    button: ButtonProps
}

export default function TextInputWithButton(props: TextInputWithButtonProps) {
    return (
        <div className="input-group">
            <TextInput {...props.textInput} />
            <Button {...props.button} />
        </div>
    )
}