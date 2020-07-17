import {Tooltip} from "react-bootstrap";
import React from "react";

export const RenderPublicTooltip = (props: any) => {
    return (<Tooltip id="public_tooltip" {...props}>
        When checked, other players in the campaign will be able to see this
    </Tooltip>)
}