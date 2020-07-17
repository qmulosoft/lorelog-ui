import React, {ChangeEvent, Dispatch, FormEvent, useContext, useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import LoreForm from "../form_component";
import {Button, InputGroup, Image, Col} from "react-bootstrap";
import {useParams} from "react-router-dom"
import ReactMarkdown from 'react-markdown'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css';
import {FormTextCheckbox} from "../shared_checkbox_formtext";
import {appContext} from "../../App";

export enum PlaceType {
    DOMAIN = "domain",
    REGION = "region",
    CITY = "city",
    DUNGEON = "dungeon"
}

export interface PlaceFormProps {
    type?: PlaceType
}

export interface PlaceData {
    id?: number,
    name: string,
    description: string,
    type: string,
    map_url?: string,
    rich_description?: string,
    is_public: boolean,
    creator_id?: string
}

const getDomain = async (apiFetch: Function, setPlaceData: Dispatch<PlaceData>) => {
    const res = await apiFetch(`places?type=domain`);
    const body = await res.json() as PlaceData[];
    if (body.length === 1) {
        // @ts-ignore
        setPlaceData(body[0]);
    }
};

export const PlaceForm = (props: PlaceFormProps) => {
    const {id} = useParams();
    const {claims} = useContext(appContext);
    const [placeData, setPlaceData] = useState<PlaceData>({
        id: id,
        name: "",
        type: props.type?.toString() || "",
        description: "",
        rich_description: "",
        is_public: false
    });

    const types = ["domain", "region", "city", "dungeon"];
    const [isNew, setIsNew] = useState(id === undefined || id === null);
    const [canEdit, setCanEdit] = useState(isNew);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showMap, setShowMap] = useState(false);
    const {apiFetch} = useContext(appContext);

    const handleRichTextUpdate = ( (content: {html: string, text: string}, event: ChangeEvent<HTMLTextAreaElement> | undefined) => {
        const copy = {...placeData};
        copy.rich_description = content.text;
        setPlaceData(copy);
    });

    useEffect(() => {
        if (props.type === PlaceType.DOMAIN) {
            // there is only one domain, so there is no list view. If the user visits this page, and there IS a domain, it
            // is a view screen. Otherwise they are allowed to create one
            // TODO only allow the DM to create a domain
            getDomain(apiFetch, setPlaceData);
        }
    }, [props.type])

    useEffect(() => {
        if (placeData.map_url) {
            const map_url = placeData.map_url;
            if (map_url.endsWith(".png") || map_url.endsWith(".svg") || map_url.endsWith(".jpg") || map_url.endsWith(".jpeg")) {
                setShowMap(true);
            } else {
                setShowMap(false);
            }
        } else {
            setShowMap(false);
        }
        if (placeData.id) {
            setIsNew(false);
        }
    }, [placeData]);

    return (
        <LoreForm
            claims={claims}
            resourceName="places"
            setCanEdit={setCanEdit}
            getData={() => placeData}
            setData={setPlaceData}
            setSuccess={setMessage}
            setFailure={setError}
            dataId={placeData.id}
            apiFetch={apiFetch}
        >
            <div className="columnForm">
                <p className="Form-header">{ isNew ? "Create New Place" : "Place Information" }</p>
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
                                    value={placeData.name}
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
                                    as="select" id="type" required
                                    value={placeData.type} readOnly={!canEdit}
                                >
                                    { types.map((type) => <option>{type}</option>) }
                                </Form.Control>
                            </InputGroup>
                        </Col>
                    </Form.Row>
                    <FormTextCheckbox checked={placeData.is_public} canEdit={canEdit} />
                </Form.Group>
                {canEdit ?
                    <Form.Group>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>
                                    Map URL
                                </InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                id="map_url" readOnly={!canEdit}
                                type="text" maxLength={128} value={placeData.map_url}
                            />
                        </InputGroup>
                        <Form.Text>If this is an image, it will be automatically displayed</Form.Text>
                    </Form.Group>
                    : null
                }
                { showMap
                    ? <Image rounded fluid className="map" src={placeData.map_url}/>
                    : <p><Button onClick={() => {window.open(placeData.map_url)}}>View the Map</Button></p>
                }
                <Form.Group>
                    <Form.Label>Brief Description</Form.Label>
                    <Form.Control
                        readOnly={!canEdit}
                        as="textarea" id="description" maxLength={255}
                        value={placeData.description}
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
                        value={placeData.rich_description}
                    />
                        <Form.Text>Unlimited length, rich formatting available. Preview will display below</Form.Text></> : null}
                </Form.Group>
                <ReactMarkdown source={placeData.rich_description} />
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