import { useContext } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import "./SidebarLink.css";
import { NavigationContext } from "../../../context";
import { type Page } from "../../../pages/index";

export type SidebarLinkProps = {
    target: Page,
    title: string,
    tooltip?: string,
    pages?: Page[]
}

export default function SidebarLink(props: SidebarLinkProps) {
    const navContext = useContext(NavigationContext);

    if (props.pages && props.pages.includes(navContext.page)) {
        return (
            <div title={props.tooltip} className={"sidebar-link sidebar-link-paged active"}>
                <div style={{ fontSize: "3vh", width: "30px" }} onClick={() => {
                    navContext.setPage(props.pages![props.pages!.indexOf(navContext.page) - 1]);
                }} >
                    {hasLeftPage(navContext.page, props.pages) ? <FiChevronLeft /> : null}
                </div>
                <div>
                    {props.title}
                </div>
                <div style={{ fontSize: "3vh", width: "30px" }} onClick={() => {
                    navContext.setPage(props.pages![props.pages!.indexOf(navContext.page) + 1]);
                }} >
                    {hasRightPage(navContext.page, props.pages) ? <FiChevronRight /> : null}
                </div>
            </div>
        );
    } else {
        return (
            <div title={props.tooltip} className={navContext.page === props.target ? "sidebar-link active" : "sidebar-link"} onClick={() => navContext.setPage(props.target)}>
                {props.title}
            </div>
        );
    }
}

function hasLeftPage(current: Page, pages: Page[]) {
    return pages.indexOf(current) > 0
}

function hasRightPage(current: Page, pages: Page[]) {
    return pages.indexOf(current) < pages.length - 1;
}