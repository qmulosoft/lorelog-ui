import {FormText, FormCheck, Col, OverlayTrigger, Row} from "react-bootstrap";
import {RenderPublicTooltip} from "./share_tooltip";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons";
import React from "react";

export interface FormTextCheckboxProps {
    checked: boolean
    canEdit: boolean
    scope?: string
}

export const FormTextCheckbox = (props: FormTextCheckboxProps) => {
    return (
        <FormText>
            <Row>
                <Col>
                    <FormCheck
                        type="switch"
                        label={
                            <span>
                                Shared &nbsp;
                                <OverlayTrigger overlay={RenderPublicTooltip}>
                                    <FontAwesomeIcon icon={faQuestionCircle}/>
                                </OverlayTrigger>
                            </span>}
                        id={props.scope ? `${props.scope}:is_public` : 'is_public'}
                        checked={props.checked}
                        disabled={!props.canEdit}
                    />
                </Col>
            </Row>
        </FormText>
    );
}