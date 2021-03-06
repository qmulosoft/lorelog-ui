import React, {useContext, useEffect, useState} from "react";
import {Card, Row, Col, Image, Nav, Button} from "react-bootstrap";
import VizSensor from "react-visibility-sensor";
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
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

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
    img_url?: string,
    data?: ChronicleData
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
    const history = useHistory();
    const {url} = useRouteMatch();

    const processEntries = async (res: Response) => {
        const body = await res.json();
        setEntries(body);
    }

    const getContent = async (idx: number) => {
        if (entries[idx].data) {
            return;
        }
        const id = entries[idx].id
        const res = await apiFetch(`chronicle/${id}`);
        const body = await res.json() as ChronicleData;
        const copy = [...entries];
        copy[idx].data = body;
        setEntries(copy);
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
    <div className="Table-page">
        <p className="Form-header" style={{textAlign: "center"}}>{ `Chronicle entries` }</p>
        <Button className="Table-control" onClick={() => {history.push(`${url}/new`)}}>Add Entry</Button>
            { entries.map((entry, idx) =>
                <VizSensor onChange={visible => visible ? getContent(idx) : null} key={entry.id}>
                <Card>
                    <Card.Header>
                        <Row style={{height: "2.5em"}}>
                            <Col xs={1} md={1} className="xs-omit">
                                <Image style={{maxHeight: "2.5em"}} src={
                                    entry.img_url ? entry.img_url : getEntryIcon(entry)}
                                />
                            </Col>
                            <Col xs={10} md={10}>
                                <p style={{fontSize: "1.4em"}}>{entry.title}</p>
                            </Col>
                            <Col xs={2} md={1}>
                                <Image style={{maxHeight: "2.5em"}} src={entry.is_public ? public_icon : private_icon}/>
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body>
                        { entry.data
                        ? <>
                            <div className="flex-header chronicle-options">
                                <Nav.Link
                                    onClick={() => history.push(`/${entry.relation_type}s/${entry.data!.relation_id}`)}
                                >
                                    { entry.relation_type[0].toUpperCase() + entry.relation_type.substring(1) } Page
                                </Nav.Link>
                                <Nav.Link
                                    onClick={() => history.push(`/chronicle/${entry.id}`)}
                                >
                                    Entry Page
                                </Nav.Link>
                                <Nav.Link
                                    onClick={() => history.push(`/chronicle/new?tick=${(entry.tick || 0) - 10}`)}
                                >
                                    Add Entry Before
                                </Nav.Link>
                                <Nav.Link
                                    onClick={() => history.push(`/chronicle/new?tick=${(entry.tick || 0) + 10}`)}
                                >
                                    Add Entry After
                                </Nav.Link>
                            </div>
                            <ReactMarkdown source={entry.data!.rich_description}/>
                          </>
                            : <FontAwesomeIcon icon={faSpinner} spin/>
                        }
                    </Card.Body>
                </Card>
                </VizSensor>
            )}
    </div>
    );
}