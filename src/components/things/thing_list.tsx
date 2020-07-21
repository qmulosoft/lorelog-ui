import React, {useContext, useEffect, useState} from "react";
import {Button, Table} from "react-bootstrap";
import {useHistory} from "react-router-dom";
import {ThingData} from "./thing";
import {appContext} from "../../App";

export const ThingList = () => {
    const [thingList, setThingList] = useState<Array<ThingData>>([]);
    const {apiFetch} = useContext(appContext);
    const history = useHistory();

    const getThings = async () => {
        const res = await apiFetch("things");
        const factions = await res.json() as ThingData[];
        setThingList(factions);
    };

    useEffect(() => {
        getThings();
    }, []);

    return (
        <div>
            <p className="Form-header">Factions</p>
            <Button className="Table-control" onClick={() => {history.push("/new/thing")}}>Create New</Button>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th className="col-3">Name</th>
                    <th className="col-2">Type</th>
                    <th>Description</th>
                    <th className="col-1">Weight</th>
                    <th className="col-1">Price</th>
                </tr>
                </thead>
                <tbody>
                {thingList.map((thing) => <tr onClick={() => {
                    history.push(`/things/${thing.id}`)
                }} className="clickable">
                    <td>{thing.name}</td>
                    <td>{thing.type}</td>
                    <td><div className="truncated-cell smaller-text">{thing.description}</div></td>
                    <td>{thing.weight}</td>
                    <td>{ thing.price ? thing.price : 0 }{ thing.price_unit ? thing.price_unit : null }</td>
                </tr>)}
                </tbody>
            </Table>
        </div>
    );
}