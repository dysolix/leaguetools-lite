import "./PageContent.css";
import { useContext, useEffect } from "react";
import Pages from "../../pages";
import { AppContext, NavigationContext } from "../../context";
import { LargePageText } from "../../util";

export default function PageContent(props: {}) {
    const appContext = useContext(AppContext);
    const navContext = useContext(NavigationContext);
    const Page = Pages[navContext.page];

    return (
        <div id="page-content-wrapper">
            {appContext.ready ? (Page !== undefined ? <Page /> : null) : <LargePageText text="Loading..." />}
        </div>
    );
}