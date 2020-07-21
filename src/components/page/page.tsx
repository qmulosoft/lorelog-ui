import React from "react";
import {Button, Tab, Tabs} from "react-bootstrap";
import {Route, Switch, useHistory, useParams, useRouteMatch} from "react-router-dom"
import 'react-markdown-editor-lite/lib/index.css';
import {ChronicleEntryType, ChronicleList} from "../chronicle/chronicle_list";
import {ChronicleForm} from "../chronicle/chronicle";

export interface PageProps {
    form: any
}

export const Page = (props: PageProps) => {
    const {id} = useParams();
    const history = useHistory();
    const {path, url} = useRouteMatch();
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
    const typeName = type.toString()[0].toUpperCase() + type.toString().substring(1);

    return (
        <div className="columnForm">
            <Tabs id="faction-nav" onSelect={(key: string | null) => {
                let newPath = url;
                if (key) {
                    newPath += "/" + key;
                }
                history.push(`${newPath}`);
            }} defaultActiveKey={history.location.pathname.includes("chronicle") ? "chronicle" : ""}>
                <Tab title={typeName} eventKey="">
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
            </Tabs>
        </div>
    );
};