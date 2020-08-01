import React, { Dispatch, useContext, useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { FactionData } from "./faction";
import { appContext } from "../../App";

export const FactionList = () => {
    const [factionList, setFactionList] = useState<Array<FactionData>>([]);
    const history = useHistory();
    const { apiFetch } = useContext(appContext);

    const getFactions = async () => {
        const res = await apiFetch("factions");
        const factions = await res.json() as FactionData[];
        setFactionList(factions);
    };

    useEffect(() => {
        getFactions();
    }, []);

    return (
        <div className={"Table-page"}>
            <p className="Form-header">Factions</p>
            <Button className="Table-control" onClick={() => { history.push("/new/faction") }}>Create New</Button>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th className="col-3">Name</th>
                        <th>Description</th>
                        <th className="col-1">Members</th>
                    </tr>
                </thead>
                <tbody>
                    {factionList.map((faction) => <tr onClick={() => {
                        history.push(`/factions/${faction.id}`)
                    }} className="clickable">
                        <td>{faction.name}</td>
                        <td><div className="truncated-cell smaller-text">{faction.description}</div></td>
                        <td>{0}</td>
                    </tr>)}
                </tbody>
            </Table>
        </div>
    );
}