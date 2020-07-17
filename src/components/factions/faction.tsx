import React, {ChangeEvent, useContext, useState} from "react";
import Form from "react-bootstrap/Form";
import LoreForm from "../form_component";
import {Button, InputGroup} from "react-bootstrap";
import {useParams} from "react-router-dom"
import ReactMarkdown from 'react-markdown'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css';
import {FormTextCheckbox} from "../shared_checkbox_formtext";
import {appContext} from "../../App";

export interface FactionData {
    id?: number,
    name: string,
    description: string,
    rich_description?: string,
    is_public: boolean,
    creator_id?: string
}

export const FactionForm = () => {
    const {id} = useParams();
    const {claims} = useContext(appContext);
    const [factionData, setFactionData] = useState<FactionData>({
        id: id,
        name: "",
        description: "",
        rich_description: "",
        is_public: false
    });
    const isNew = id === undefined || id === null;
    const [canEdit, setCanEdit] = useState(isNew);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const {apiFetch} = useContext(appContext)

    const handleRichTextUpdate = ( (content: {html: string, text: string}, event: ChangeEvent<HTMLTextAreaElement> | undefined) => {
        const copy = {...factionData};
        copy.rich_description = content.text;
        setFactionData(copy);
    });

    return (
        <LoreForm
            claims={claims}
            resourceName="factions"
            setCanEdit={setCanEdit}
            getData={() => factionData}
            setData={setFactionData}
            setSuccess={setMessage}
            setFailure={setError}
            dataId={id}
            apiFetch={apiFetch}
        >
            <div className={"columnForm"}>
                <p className="Form-header">{ isNew ? "Create New Faction" : "Faction Information" }</p>
                <Form.Group>
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text as={Form.Label}>
                                Name
                            </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                            readOnly={!canEdit}
                            type="text" maxLength={32} id="name"
                            value={factionData.name}
                        />
                    </InputGroup>
                    <FormTextCheckbox checked={factionData.is_public} canEdit={canEdit}/>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Brief Description</Form.Label>
                    <Form.Control
                        readOnly={!canEdit}
                        as="textarea" id="description" maxLength={255}
                        value={factionData.description}
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
                        value={factionData.rich_description}
                    />
                        <Form.Text>Unlimited length, rich formatting available. Preview will display below</Form.Text></> : null}
                </Form.Group>
                <ReactMarkdown source={factionData.rich_description} />
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