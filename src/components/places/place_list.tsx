import React, {useContext, useEffect, useState} from "react";
import {Button, Table, Form} from "react-bootstrap";
import {useHistory} from "react-router-dom";
import {PlaceData, types} from "./place";
import {appContext} from "../../App";
import {addFilter, Filters} from "../../utils/filter";

export const PlaceList = () => {
    const [placeList, setPlaceList
    ] = useState<Array<PlaceData>>([]);
    const [filters, setFilters] = useState<Filters>({});
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
        <div className="Table-page">
            <p className="Form-header">Factions</p>
            <Button className="Table-control" onClick={() => {history.push("/new/place")}}>Create New</Button>
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th className="col-3">Name</th>
                    <th>Description</th>
                    <th className="col-2">Type</th>
                </tr>
                <tr>
                    <th>
                        <Form.Control type="text" onChange={event => {
                            const copy = addFilter(event, filters, "name", "", (place: PlaceData, v: string) => place.name.includes(v));
                            setFilters(copy);
                        }} placeholder="Filter Results"/>
                    </th>
                    <th>
                        <Form.Control type="text" onChange={event => {
                            const copy = addFilter(event, filters, "description", "", (thing: PlaceData, v: string) => {
                                if (thing.description) {
                                    let found = true;
                                    v.split(" ").forEach((word) => {
                                        if (!thing.description?.includes(word)) {
                                            found = false;
                                        }
                                    })
                                    return found;
                                } else {
                                    return false
                                }
                            })
                            setFilters(copy);
                        }} placeholder="Word Search"/>
                    </th>
                    <th>
                        <Form.Control as="select" onChange={event => {
                            setFilters(addFilter(event, filters, "type", "all", (place: PlaceData, v: string) => place.type === v))
                        }}>
                            <option>all</option>
                            {types.map(type => <option>{type}</option>)}
                        </Form.Control>
                    </th>
                </tr>
                </thead>
                <tbody>
                {placeList.filter(thing => {
                    let show = true;
                    Object.values(filters).forEach(filter => {
                        if (!filter(thing)) {
                            // filters are never likely to be that huge, doesn't matter that it doesn't break early
                            show = false;
                        }
                    });
                    return show;
                }).map((place) => <tr onClick={() => {
                    history.push(`/places/${place.id}`)
                }} className="clickable">
                    <td>{place.name}</td>
                    <td><div className="truncated-cell smaller-text">{place.description}</div></td>
                    <td>{place.type}</td>
                </tr>)}
                </tbody>
            </Table>
        </div>
    );
}