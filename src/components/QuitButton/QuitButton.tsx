import MainProcessIpc from "../../main-process";
import "./QuitButton.css";

export default function QuitButton() {
    return (
        <div id="quit-button" className='sidebar-link' onClick={() => MainProcessIpc.exit(true)}>
          Quit
        </div>
    )
}