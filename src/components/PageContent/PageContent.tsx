import "./PageContent.css";
import { useContext } from "react";
import Pages from "../../pages";
import { NavigationContext } from "../../context";

export default function PageContent(props: {}) {
    const navContext = useContext(NavigationContext);
    const Page = Pages[navContext.page];

    return (
        <div id="page-content-wrapper">
            {Page !== undefined ? <Page /> : null}
        </div>
    );
}