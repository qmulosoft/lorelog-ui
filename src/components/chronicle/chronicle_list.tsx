import React, {useContext, useEffect, useState} from "react";
import {Accordion, Card, Row, Col, Image, Nav, Button} from "react-bootstrap";
import {Claims} from "../../types/claims";
import hourglass_icon from "../../assets/hourglass.svg";
import private_icon from "../../assets/private_icon.svg";
import public_icon from "../../assets/public_icon.svg";
import character_icon from "../../assets/character_icon.svg"
import faction_icon from "../../assets/faction_icon.svg";
import place_icon from "../../assets/place_icon.svg";
import thing_icon from "../../assets/book_icon.svg"
import {appContext} from "../../App";
import ReactMarkdown from "react-markdown";
import {ChronicleData} from "./chronicle";
import {useRouteMatch, useHistory} from "react-router-dom";

export enum ChronicleEntryType {
    Character = "character",
    Faction = "faction",
    Domain = "domain",
    Place = "place",
    Thing = "thing"
}

export interface ChronicleSummary {
    id: string,
    title: string,
    relation_type: ChronicleEntryType,
    tick: number,
    is_public: boolean,
    img_url?: string
}

export interface ChronicleListProps {
    relation_type?: ChronicleEntryType
    relation_id?: number
}

const getEntryIcon = (entry: ChronicleSummary) => {
    switch (entry.relation_type) {
        case ChronicleEntryType.Character: return character_icon
        case ChronicleEntryType.Domain: return hourglass_icon
        case ChronicleEntryType.Faction: return faction_icon
        case ChronicleEntryType.Place: return place_icon
        case ChronicleEntryType.Thing: return thing_icon
        default: return hourglass_icon
    }
}

export const ChronicleList = (props: ChronicleListProps) => {
    const {apiFetch} = useContext(appContext);
    const [entries, setEntries] = useState<ChronicleSummary[]>([]);
    const [content, setContent] = useState<{[id: string]: ChronicleData}>({});
    const history = useHistory();
    const {url} = useRouteMatch();

    const processEntries = async (res: Response) => {
        const body = await res.json();
        setEntries(body);
    }

    const getContent = async (id: string) => {
        if (content[id]) { return; }
        const res = await apiFetch(`chronicle/${id}`);
        const body = await res.json() as ChronicleData;
        const copy = {...content};
        if (body.rich_description != null) {
            copy[id] = body;
            setContent(copy);
        }
    }

    useEffect(() => {
        let params = [];
        if (props.relation_type) {
            params.push("relation_type=" + props.relation_type.toString());
            if (props.relation_id) {
                params.push("relation_id=" + props.relation_id);
            }
        }
        const res = apiFetch(`chronicle?${params.join("&")}`);
        if (res) {
            res.then((a: Response) => processEntries(a));
        }
    }, [props.relation_type, props.relation_id])

    return (
    <div style={{textAlign: "left"}}>
        <p className="Form-header" style={{textAlign: "center"}}>{ `Chronicle entries` }</p>
        <Button className="Table-control" onClick={() => {history.push(`${url}/new`)}}>Add Entry</Button>
        <Accordion defaultActiveKey={entries.length ? entries[0].id : undefined} style={{textAlign: "left"}}>
            { entries.map(entry =>
                <Card>
                    <Accordion.Toggle as={Card.Header} eventKey={entry.id} onClick={() => getContent(entry.id)} className="clickable">
                        <Row style={{height: "2.5em"}}>
                            <Col xs={2} md={1}>
                                <Image style={{maxHeight: "2.5em"}} src={
                                    entry.img_url ? entry.img_url : getEntryIcon(entry)}
                                />
                            </Col>
                            <Col xs={true} md={true}>
                                <p style={{fontSize: "1.4em"}}>{entry.title}</p>
                            </Col>
                            <Col xs={2} md={1}>
                                <Image style={{maxHeight: "2.5em"}} src={entry.is_public ? public_icon : private_icon}/>
                            </Col>
                        </Row>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={entry.id}>
                        <Card.Body>
                            { content[entry.id]
                            ? <>
                                    <div className="flex-header chronicle-options">
                                        <Nav.Link
                                            onClick={() => history.push(`/${entry.relation_type}s/${content[entry.id].relation_id}`)}
                                        >
                                            { entry.relation_type[0].toUpperCase() + entry.relation_type.substring(1) } Page
                                        </Nav.Link>
                                        <Nav.Link
                                            onClick={() => history.push(`/chronicle/${entry.id}`)}
                                        >
                                            Entry Page
                                        </Nav.Link>
                                        <Nav.Link
                                            onClick={() => history.push(`/chronicle/new?tick=${(content[entry.id].tick || 0) - 10}`)}
                                        >
                                            Add Entry Before
                                        </Nav.Link>
                                        <Nav.Link
                                            onClick={() => history.push(`/chronicle/new?tick=${(content[entry.id].tick || 0) + 10}`)}
                                        >
                                            Add Entry After
                                        </Nav.Link>
                                    </div>
                                    <ReactMarkdown source={content[entry.id]?.rich_description}/>
                              </>
                            : null
                            }
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            )}
        </Accordion>
    </div>
    );
}