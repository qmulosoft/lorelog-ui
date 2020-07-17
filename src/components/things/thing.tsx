import React, {ChangeEvent, useContext, useState} from "react";
import LoreForm from "../form_component";
import {Claims} from "../../types/claims";
import {FormTextCheckbox} from "../shared_checkbox_formtext";
import {useParams} from "react-router-dom";
import {Form, InputGroup, Button, Col} from "react-bootstrap";
import ReactMarkdown from 'react-markdown'
import MdEditor from 'react-markdown-editor-lite'
import {appContext} from "../../App";

export interface ThingData {
    id: number
    name: string
    type: string
    weight?: number
    price?: number
    price_unit?: string
    description?: string
    rich_description?: string
    is_public: boolean,
    owner_id?: number,
    creator_id?: string
}

export const ThingForm = () => {
    const {id} = useParams();
    const {claims} = useContext(appContext);
    const [thingData, setThingData] = useState<ThingData>({
        id: id,
        name: "",
        type: "",
        rich_description: "",
        is_public: false
    });
    const isNew = id === undefined || id === null;
    const [canEdit, setCanEdit] = useState(isNew);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const types = ["missive", "scroll", "book", "weapon", "armor", "equipment", "artifact", "key", "reagent", "sundry", "other"];
    const currencies = ["cp", "sp", "ep", "gp", "pp", "credits", "dollars", "other"];

    const handleRichTextUpdate = ( (content: {html: string, text: string}, event: ChangeEvent<HTMLTextAreaElement> | undefined) => {
        const copy = {...thingData};
        copy.rich_description = content.text;
        setThingData(copy);
    });

    const {apiFetch} = useContext(appContext);

    return (
        <LoreForm
            claims={claims}
            resourceName="things"
            setCanEdit={setCanEdit}
            getData={() => thingData}
            setData={setThingData}
            setSuccess={setMessage}
            setFailure={setError}
            dataId={id}
            apiFetch={apiFetch}
        >
            <div className="columnForm">
                <p className="Form-header">{ isNew ? "Create New Thing" : "Thing Information" }</p>
                <Form.Group>
                    <Form.Row>
                        <Col>
                            <InputGroup>
                                <InputGroup.Prepend>
                                    <InputGroup.Text as={Form.Label}>
                                        Name
                                    </InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    readOnly={!canEdit} required
                                    type="text" maxLength={32} id="name"
                                    value={thingData.name}
                                />
                            </InputGroup>
                        </Col>
                        <Col xs={5}>
                            <InputGroup>
                                <InputGroup.Prepend>
                                    <InputGroup.Text as={Form.Label}>
                                        Type
                                    </InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    as="select" id="type"
                                    value={thingData.type} readOnly={!canEdit}
                                >
                                    { types.map((type) => <option>{type}</option>) }
                                </Form.Control>
                            </InputGroup>
                        </Col>
                    </Form.Row>
                    <FormTextCheckbox checked={thingData.is_public} canEdit={canEdit} />
                </Form.Group>
                <Form.Group as={Form.Row}>
                    <Col>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text>Weight</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="text" value={thingData.weight} readOnly={!canEdit} id="weight"/>
                        </InputGroup>
                    </Col>
                    <Col>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text>Price</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control type="text" value={thingData.price} readOnly={!canEdit} id="price"/>
                            <Form.Control
                                as="select" value={thingData.price_unit} readOnly={!canEdit} id="price_unit"
                            >
                                { currencies.map(currency => <option>{currency}</option>)}
                            </Form.Control>
                        </InputGroup>
                    </Col>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Brief Description</Form.Label>
                    <Form.Control
                        readOnly={!canEdit}
                        as="textarea" id="description" maxLength={255}
                        value={thingData.description}
                    />
                    <Form.Text>This will show up in search results and summaries</Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Full Description</Form.Label>
                    {canEdit ? <><MdEditor
                        renderHTML={(text) => <ReactMarkdown source={text}/>}
                        config={{
                            view: {menu: true, md: true, html: false},
                            canView: {menu: true, md: true, html: false, fullScreen: true}
                        }}
                        onChange={handleRichTextUpdate}
                        value={thingData.rich_description}
                    />
                        <Form.Text>Unlimited length, rich formatting available. Preview will display below</Form.Text></> : null}
                </Form.Group>
                <ReactMarkdown source={thingData.rich_description} />
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
