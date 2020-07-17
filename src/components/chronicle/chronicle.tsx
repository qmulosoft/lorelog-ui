import React, {ChangeEvent, useContext, useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import LoreForm from "../form_component";
import {Button, Col, InputGroup, Row} from "react-bootstrap";
import {useLocation, useParams, useRouteMatch} from "react-router-dom"
import ReactMarkdown from 'react-markdown'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css';
import {FormTextCheckbox} from "../shared_checkbox_formtext";
import {appContext} from "../../App";
import {ChronicleEntryType} from "./chronicle_list";

export interface ChronicleData {
    id?: string,
    title: string,
    tick?: number,
    rich_description?: string,
    is_public: boolean,
    creator_id?: string,
    relation_type: ChronicleEntryType,
    relation_id: number,
}

interface RelationData {
    id: number,
    name: string,
}

export interface ChronicleProps {
    type: ChronicleEntryType
}

export const ChronicleForm = (props: ChronicleProps) => {
    const types = ["faction", "character", "place", "thing"];
    const {id, chronicleID} = useParams();
    const {search} = useLocation();
    const {claims} = useContext(appContext);
    const queryParams = {} as {[param: string] : string};
    if (search) {
        const cleaned = search.substring(1); // drop '?'
        const parts = cleaned.split("&");
        parts.forEach(part => {
            if (part.includes("=")) {
                const [k,v] = part.split("=")
                queryParams[k] = v;
            } else {
                queryParams[part] = "";
            }
        });
    }

    const [chronicleData, setChronicleData] = useState<ChronicleData>({
        id: chronicleID,
        title: "",
        rich_description: "",
        is_public: false,
        relation_type: props.type,
        relation_id: id,
        tick: queryParams['tick'] ? parseInt(queryParams['tick']) : undefined
    });
    const isNew = chronicleID === undefined || chronicleID === null || chronicleID === "new";
    const [canEdit, setCanEdit] = useState(isNew);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const {apiFetch} = useContext(appContext)
    const [relations, setRelations] = useState<RelationData[]>([]);

    const getRelatedData = async () => {
        const res = await apiFetch(`${chronicleData.relation_type}s`);
        const body = await res.json() as RelationData[];
        setRelations(body);
    };

    useEffect(() => {
        if (isNew && chronicleData.relation_type !== ChronicleEntryType.Domain) {
            getRelatedData();
        }
    }, [isNew, chronicleData.relation_type, apiFetch]);

    const handleRichTextUpdate = ( (content: {html: string, text: string}, event: ChangeEvent<HTMLTextAreaElement> | undefined) => {
        const copy = {...chronicleData};
        copy.rich_description = content.text;
        setChronicleData(copy);
    });

    return (
        <LoreForm
            claims={claims}
            resourceName="chronicle"
            setCanEdit={setCanEdit}
            getData={() => chronicleData}
            setData={setChronicleData}
            setSuccess={setMessage}
            setFailure={setError}
            dataId={chronicleID}
            apiFetch={apiFetch}
        >
            <div className="columnForm">
                <p className="Form-header">{ isNew ? "Add New Chronicle Entry" : "Chronicle Entry" }</p>
                <Form.Group as={Row}>
                    <Col>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>
                                    Title
                                </InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                readOnly={!canEdit} required
                                type="text" maxLength={64} id="chronicle:title"
                                value={chronicleData.title}
                            />
                        </InputGroup>
                        <FormTextCheckbox checked={chronicleData.is_public} canEdit={canEdit} scope="chronicle"/>
                    </Col>
                    <Col xs={3}>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>
                                    Seq
                                </InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="text" value={chronicleData.tick} readOnly={!canEdit} id="chronicle:tick"/>
                        </InputGroup>
                        <Form.Text>You can usually leave this unchanged</Form.Text>
                    </Col>
            </Form.Group>
            { isNew
            ?
                <Form.Group as={Row}>
                    <Col>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>
                                    Type
                                </InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control as="select" id="relation_type" value={chronicleData.relation_type} required>
                                <option value="">Choose</option>
                                { types.map(type => <option>{type}</option>) }
                            </Form.Control>
                        </InputGroup>
                    </Col>
                    <Col>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>
                                    Record
                                </InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control as="select" id="relation_id" value={chronicleData.relation_id} required>
                                { <option/> }
                                { relations.map(relation => <option value={relation.id} label={relation.name}/>)}
                            </Form.Control>
                        </InputGroup>
                    </Col>
                </Form.Group>
            :
                null
            }
            <Form.Group>
                <Form.Label>Entry</Form.Label>
                {canEdit ? <><MdEditor
                    renderHTML={(text) => <ReactMarkdown source={text}/>}
                    config={{
                        view: {menu: true, md: true, html: false},
                        canView: {menu: true, md: true, html: false, fullScreen: true}
                    }}
                    onChange={handleRichTextUpdate}
                    value={chronicleData.rich_description}
                    />
                    <Form.Text>Unlimited length, rich formatting available. Preview will display below</Form.Text></>
                    : null}
                </Form.Group>
                <ReactMarkdown source={chronicleData.rich_description} />
                { error ? <p className="Form-error">{error}</p> : null }
                { message ? <p className="Form-success">{message}</p> : null }
                { canEdit ?
                    <Button type="submit">{isNew ? "Create" : "Save Changes"}</Button>
                    : null
                }
            </div>
        </LoreForm>
    );
};