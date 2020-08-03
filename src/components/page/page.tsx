import React, {useEffect, useState} from "react";
import {Tab, Tabs} from "react-bootstrap";
import {Route, Switch, useHistory, useParams, useRouteMatch} from "react-router-dom"
import 'react-markdown-editor-lite/lib/index.css';
import {ChronicleEntryType, ChronicleList} from "../chronicle/chronicle_list";
import {ChronicleForm} from "../chronicle/chronicle";
import {RelationsTable} from "../relations_table";

export interface RelationTabs {
    [relationType: string]: {
        name: string,
        string_fields?: string[]
    }
}

export interface PageProps {
    form: any
    double?: boolean
    relations?: RelationTabs
}

export const Page = (props: PageProps) => {
    const {id} = useParams();
    const history = useHistory();
    const {path, url} = useRouteMatch();
    const [key, setKey] = useState(history.location.pathname.includes("chronicle") ? "chronicle" : "main");
    const Form = props.form;
    let type = ChronicleEntryType.Domain;
    // path for creating a chronicle entry must be e.g. /factions/:id/chronicle/:chronicleID
    // Where chronicleID is 'new' for new
    const relationPath = path.split("/")[1];
    switch (relationPath) {
        case "factions":
            type = ChronicleEntryType.Faction;
            break;
        case "characters":
            type = ChronicleEntryType.Character;
            break;
        case "places":
            type = ChronicleEntryType.Place;
            break;
        case "things":
            type = ChronicleEntryType.Thing;
            break;
    }

    useEffect(() => {
        const validKeys = ["main", "chronicle"];
        if (props.relations) {
            Object.keys(props.relations).forEach(path => {
                validKeys.push(path);
            });
        }
        if (validKeys.indexOf(key) < 0) {
            setKey(history.location.pathname.includes("chronicle") ? "chronicle" : "main");
        }
    }, [history.location.pathname, key, props])

    const typeName = type.toString()[0].toUpperCase() + type.toString().substring(1);

    return (
        <div className={props.double ? "multiColumnFormContainer" : "columnForm"}>
            <Tabs id={path} onSelect={(key: string | null) => {
                let newPath = url;
                if (key) {
                    if (key !== "main") {
                        newPath += "/" + key;
                    }
                    setKey(key);
                }
                history.push(`${newPath}`);
            }} activeKey={key} mountOnEnter>
                <Tab title={typeName} eventKey="main">
                    <Form/>
                </Tab>
                <Tab title="Chronicle" eventKey="chronicle">
                    <Switch>
                        <Route path={`${path}/chronicle`} exact>
                            <ChronicleList relation_type={type} relation_id={id}/>
                        </Route>
                        <Route path={`${path}/chronicle/:chronicleID`}>
                            <ChronicleForm type={type}/>
                        </Route>
                    </Switch>
                </Tab>
                { props.relations
                    ? Object.keys(props.relations).map(path =>
                        <Tab title={props!.relations![path].name} eventKey={path}>
                            <RelationsTable stringFields={props!.relations![path].string_fields}/>
                        </Tab>
                    )
                    : null
                }
            </Tabs>
        </div>
    );
};