import React, {Dispatch, useContext, useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import { Button, InputGroup, OverlayTrigger, Row, Col } from "react-bootstrap";
import { useParams, useHistory } from "react-router-dom"
import { RenderPublicTooltip } from "../share_tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import {appContext} from "../../App";

export interface CharacterData {
    id?: string,
    name: string,
    race: string,
    description: string,
    notes?: string,
    level: number,
    class: string,
    class_level: number,
    secondary_class?: string,
    secondary_class_level?: number,
    str?: number,
    dex?: number,
    con?: number,
    int?: number,
    wis?: number
    cha?: number,
    alignment?: string,
    attr_stats_other?: string,
    sheet_url?: string,
    is_pc: boolean,
    is_public: boolean,
    attributes_public: boolean,
    campaign?: number,
    creator_id?: string
}

const getFormValue = (element: HTMLInputElement) => {
    const booleans = ["attributes_public", "is_public", "is_pc"];
    if (booleans.indexOf(element.id) >= 0) {
        return element.checked;
    } else {
        return element.value;
    }
};

export const CharacterForm = () => {
    const {id} = useParams();
    const history = useHistory();
    const {claims} = useContext(appContext);
    const [characterData, setCharacterData] = useState<CharacterData>({
        id: id,
        name: "",
        race: "",
        description: "",
        level: 0,
        class: "",
        class_level: 0,
        is_pc: false,
        is_public: false,
        attributes_public: false,
    });
    // If props.id is null, then we are "creating" a new character so we can edit all fields
    const isNew = id === undefined || id === null;
    const [canEdit, setCanEdit] = useState<boolean>(isNew);
    const [showAttributes, setShowAttributes] = useState<boolean>(isNew);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const {apiFetch} = useContext(appContext);

    const createNew = async () => {
        const res = await apiFetch("characters", {
            method: "post",
            body: JSON.stringify(characterData)
        }, setError);
        if (res.status === 201) {
            const data = await res.json() as CharacterData;
            setMessage("Successfully created new character. Redirecting you to the character page");
            setTimeout(() => {
                history.push(`/characters/${data.id}`);
                setMessage("");
            }, 500);
        } else {
            const data = await res.json();
            setError(data.title);
        }
    }

    const update = async () => {
        const res = await apiFetch(`characters/${characterData.id}`, {
            method: "PATCH",
            body: JSON.stringify(characterData),
        }, setError);
        if (res.status === 200) {
            setMessage("Saved successfully");
        } else {
            const body = await res.json();
            setError(body.title);
        }
    }

    const getCharacter = async () => {
        const res = await apiFetch(`characters/${id}`);
        const character = await res.json() as CharacterData;
        setCharacterData(character);
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = {} as CharacterData;
        // @ts-ignore
        for (const element of event.currentTarget) {
            // @ts-ignore
            form[element.id] = getFormValue(element);
        }
        if (isNew) {
            createNew();
        } else {
            update();
        }
    };

    useEffect(() => {
        if (id !== undefined && id !== null) {
            getCharacter();
        }
    }, [id, claims]);

    useEffect(() => {
        if (id === undefined) {
            return;
        }
        if (characterData.creator_id === claims.id) {
            setCanEdit(true);
            setShowAttributes(true);
        } else if (characterData.attributes_public) {
            setShowAttributes(true);
        }
    }, [characterData])

    const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const copy = {...characterData} as any;
        copy[target.id] = getFormValue(target);
        setCharacterData(copy);
    };

    return (
        <div className="multiColumnFormContainer">
            <p className="Form-header">{isNew ? 'New Character' : 'Character Information'}</p>
            <Form onSubmit={handleSubmit}>
                <div className="responsiveFormColumn">
                    <p className="Form-subheader">Essentials</p>
                    <Form.Group>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>Name</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                id="name"
                                readOnly={!canEdit}
                                type="text" maxLength={32}
                                value={characterData.name} onChange={handleUpdate}
                                required
                            />
                        </InputGroup>
                        <Form.Text>
                            <Row>
                                <Col>
                                    <Form.Check
                                        type="switch"
                                        label={<span>Shared <OverlayTrigger overlay={RenderPublicTooltip}>
                                            <FontAwesomeIcon icon={faQuestionCircle}/>
                                        </OverlayTrigger></span>} id="is_public"
                                        checked={characterData.is_public} onChange={handleUpdate}
                                    />
                                </Col>
                                <Col>
                                    <Form.Check
                                        type="switch"
                                        label="Player Character" id="is_pc"
                                        checked={characterData.is_pc} onChange={handleUpdate}
                                        readOnly={!canEdit}
                                    />
                                </Col>
                            </Row>
                        </Form.Text>
                    </Form.Group>
                    <Form.Row as={Form.Group}>
                        <InputGroup as={Col}>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>Race</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                readOnly={!canEdit}
                                type="text" id="race"
                                value={characterData.race} onChange={handleUpdate}
                                maxLength={32}
                            />
                        </InputGroup>
                        <InputGroup as={Col}>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>Level</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                readOnly={!canEdit}
                                type="text" maxLength={3} id="level"
                                value={characterData.level} onChange={handleUpdate}
                            />
                        </InputGroup>
                    </Form.Row>
                    <Form.Group controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            maxLength={256} readOnly={!canEdit}
                            placeholder={"A brief description of physical or personality traits"}
                            value={characterData.description} onChange={handleUpdate}
                        />
                        <Form.Text>This information is visible to other players when this character is shared</Form.Text>
                    </Form.Group>
                    { canEdit ?
                        <Form.Group controlId="notes">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea" maxLength={256}
                                placeholder={"Roleplaying notes or reminders inappropriate as chronicle entries"}
                                value={characterData.notes} onChange={handleUpdate}
                            />
                            <Form.Text>This information is private and only visible to you and the DM(s)</Form.Text>
                        </Form.Group>
                        : null
                    }
                </div>
                <div className="responsiveFormColumn">
                    <p className="Form-subheader">Class Information</p>
                    <Form.Row as={Form.Group}>
                        <InputGroup as={Col} xs={7}>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>Class</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                readOnly={!canEdit}
                                type="text" id="class" maxLength={16}
                                value={characterData.class} onChange={handleUpdate}
                            />
                        </InputGroup>
                        <InputGroup as={Col}>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>Level</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                readOnly={!canEdit}
                                type="text" id="class_level" maxLength={2}
                                value={characterData.class_level} onChange={handleUpdate}
                            />
                        </InputGroup>
                    </Form.Row>
                    {canEdit || characterData.secondary_class ?
                        <Form.Row as={Form.Group}>
                            <InputGroup as={Col} xs={7}>
                                <InputGroup.Prepend>
                                    <InputGroup.Text as={Form.Label}>2nd Class</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    type="text" id="secondary_class" maxLength={16}
                                    readOnly={!canEdit}
                                    value={characterData.secondary_class} onChange={handleUpdate}
                                />
                            </InputGroup>
                            <InputGroup as={Col}>
                                <InputGroup.Prepend>
                                    <InputGroup.Text as={Form.Label}>Level</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    type="text" id="secondary_class_level" maxLength={2}
                                    readOnly={!canEdit}
                                    value={characterData.secondary_class_level} onChange={handleUpdate}
                                />
                            </InputGroup>
                        </Form.Row> : null
                    }
                    { showAttributes ? <>
                        <div className={"flex-header"}>
                            <p className="Form-subheader">Attributes</p>
                            <Form.Check
                                type="switch"
                                label="Share attributes"
                                id="attributes_public"
                                readOnly={!canEdit}
                                checked={characterData.attributes_public} onChange={handleUpdate}
                            />
                        </div>
                        <InputGroup as={Form.Group}>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>Alignment</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                type="text" id="alignment"
                                placeholder="True Good" maxLength={16}
                                readOnly={!canEdit}
                                value={characterData.alignment} onChange={handleUpdate}
                            />
                        </InputGroup>
                        <Form.Row as={Form.Group}>
                            <InputGroup as={Col}>
                                <InputGroup.Prepend>
                                    <InputGroup.Text as={Form.Label}>Str</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    readOnly={!canEdit}
                                    type="text" id="str" maxLength={2}
                                    value={characterData.str} onChange={handleUpdate}
                                />
                            </InputGroup>
                            <InputGroup as={Col}>
                                <InputGroup.Prepend>
                                    <InputGroup.Text as={Form.Label}>Dex</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    readOnly={!canEdit}
                                    type="text" id="dex" maxLength={2}
                                    value={characterData.dex} onChange={handleUpdate}
                                />
                            </InputGroup>
                                <InputGroup as={Col}>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text as={Form.Label}>Con</InputGroup.Text>
                                    </InputGroup.Prepend>
                                <Form.Control
                                    readOnly={!canEdit}
                                    type="text" id="con" maxLength={2}
                                    value={characterData.con} onChange={handleUpdate}
                                />
                            </InputGroup>
                        </Form.Row>
                        <Form.Row as={Form.Group}>
                            <InputGroup as={Col}>
                                <InputGroup.Prepend>
                                    <InputGroup.Text as={Form.Label}>Int</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    readOnly={!canEdit}
                                    type="text" id="int" maxLength={2}
                                    value={characterData.int} onChange={handleUpdate}
                                />
                            </InputGroup>
                            <InputGroup as={Col}>
                                <InputGroup.Prepend>
                                    <InputGroup.Text as={Form.Label}>Wis</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    readOnly={!canEdit}
                                    type="text" id="wis" maxLength={2}
                                    value={characterData.wis} onChange={handleUpdate}
                                />
                            </InputGroup>
                            <InputGroup as={Col}>
                                <InputGroup.Prepend>
                                    <InputGroup.Text as={Form.Label}>Cha</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    readOnly={!canEdit}
                                    type="text" id="cha" maxLength={2}
                                    value={characterData.cha} onChange={handleUpdate}
                                />
                            </InputGroup>
                            </Form.Row>
                            <InputGroup as={Form.Group}>
                                <InputGroup.Prepend>
                                    <InputGroup.Text as={Form.Label}>Other Attributes</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control
                                    readOnly={!canEdit}
                                    type="text" maxLength={32} id="attr_stats_other"
                                    placeholder="e.g. Init: 3 Speed 35 Size L"
                                    value={characterData.attr_stats_other} onChange={handleUpdate}
                                />
                        </InputGroup>
                        </>
                        : null
                    }
                    <p className="Form-subheader">Meta Information</p>
                    { canEdit ? <>
                        <InputGroup as={Form.Group}>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>Character Sheet URL</InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control
                                type="text" id="sheet_url" maxLength={128}
                                value={characterData.sheet_url} onChange={handleUpdate}
                            />
                        </InputGroup>
                        </>
                        : null
                    }
                    { error ? <p className="Form-error">{error}</p> : null }
                    { message ? <p className="Form-success">{message}</p> : null }
                    { canEdit? <Button type="submit">{isNew ? "Create" : "Update"}</Button> : null }
                </div>
            </Form>
        </div>
    );
}