import React, {Dispatch, useContext, useEffect, useState} from "react";
import {Button, Table} from "react-bootstrap";
import {useHistory} from "react-router-dom";
import {PlaceData} from "./place";
import {appContext} from "../../App";

export const PlaceList = () => {
    const [placeList, setPlaceList
    ] = useState<Array<PlaceData>>([]);
    const history = useHistory();
    const {apiFetch} = useContext(appContext);

    const getPlaces = async () => {
        const res = await apiFetch("places");
        const factions = await res.json() as PlaceData[];
        setPlaceList(factions);
    };

    useEffect(() => {
        getPlaces();
    }, []);
    return (
        <div>
            <p className="Form-header">Factions</p>
            <Button className="Table-control" onClick={() => {history.push("/new/place")}}>Create New</Button>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th className="col-3">Name</th>
                    <th>Description</th>
                    <th className="col-2">Type</th>
                </tr>
                </thead>
                <tbody>
                {placeList.map((place) => <tr onClick={() => {
                    history.push(`/places/${place.id}`)
                }}>
                    <td>{place.name}</td>
                    <td><div className="truncated-cell smaller-text">{place.description}</div></td>
                    <td>{place.type}</td>
                </tr>)}
                </tbody>
            </Table>
        </div>
    );
}