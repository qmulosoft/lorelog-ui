import React, {useContext, useEffect, useState} from "react";
import {Button, Table, Form} from "react-bootstrap";
import {useHistory} from "react-router-dom";
import {ThingData, types} from "./thing";
import {appContext} from "../../App";
import {addFilter} from "../../utils/filter";

export const ThingList = () => {
    const [thingList, setThingList] = useState<Array<ThingData>>([]);
    const [filters, setFilters] = useState<{[key: string]: Function}>({});
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
        <div className="Table-page">
            <p className="Form-header">Factions</p>
            <Button className="Table-control" onClick={() => {history.push("/new/thing")}}>Create New</Button>
            <Table striped bordered hover responsive="md">
                <thead>
                <tr>
                    <th className="col-3">Name</th>
                    <th className="col-2">Type</th>
                    <th>Description</th>
                    <th className="col-1">Weight</th>
                    <th className="col-1">Price</th>
                </tr>
                <tr>
                    <th>
                        <Form.Control type="text" onChange={event => {
                            const copy = addFilter(event, filters, "name", "", (thing: ThingData, v: string) => thing.name.includes(v))
                            setFilters(copy);
                        }} placeholder="Filter Results"/>
                    </th>
                    <th>
                        <Form.Control as="select" onChange={event => {
                            const copy = addFilter(event, filters, "type", "all", (thing: ThingData, v: string) => thing.type === v);
                            setFilters(copy);
                        }}>
                            <option>all</option>
                            {types.map(type => <option>{type}</option>)}
                        </Form.Control>
                    </th>
                    <th>
                        <Form.Control type="text" onChange={event => {
                            const copy = addFilter(event, filters, "description", "", (thing: ThingData, v: string) => {
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
                    <th/>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {thingList.filter(thing => {
                    let show = true;
                    Object.values(filters).forEach(filter => {
                       if (!filter(thing)) {
                           // filters are never likely to be that huge, doesn't matter that it doesn't break early
                           show = false;
                       }
                    });
                    return show;
                }).map((thing) => <tr onClick={() => {
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