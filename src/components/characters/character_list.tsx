import React, {Dispatch, useContext, useEffect, useState} from "react";
import {Button, Table} from "react-bootstrap";
import {useHistory} from "react-router-dom";
import {CharacterData} from "./character";
import {appContext} from "../../App";
import {Claims} from "../../types/claims";

export const CharacterList = () => {
    const [characters, setCharacters] = useState<Array<CharacterData>>([]);
    const history = useHistory();
    const {apiFetch, claims} = useContext(appContext);
    const handleCreateNew = () => {
        history.push("/new/character");
    };

    const getCharacters = async (setCharacters: Dispatch<Array<CharacterData>>, claims: Claims) => {
        const res = await apiFetch("characters");
        const characters = await res.json() as CharacterData[];
        setCharacters(characters);
    }

    useEffect(() => {
        getCharacters(setCharacters, claims);
    }, [claims]);

    return (
        <div className="Table-page">
            <p className="Form-header">Characters</p>
            <Button className="Table-control" onClick={handleCreateNew}>Create New</Button>
            <Table striped bordered hover responsive="md">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Race</th>
                    <th>Level</th>
                    <th>Class (Primary)</th>
                    <th>Class Level</th>
                    <th>NPC</th>
                </tr>
                </thead>
                <tbody>
                {characters.map((c) =>
                    <tr id={"crow" + c.id} onClick={() => history.push(`/characters/${c.id}`)} className="clickable">
                        <td>{c.name}</td>
                        <td>{c.race}</td>
                        <td>{c.level}</td>
                        <td>{c.class}</td>
                        <td>{c.class_level}</td>
                        <td>{c.is_pc ? "no" : "yes"}</td>
                    </tr>)}
                </tbody>
          </Table>
        </div>
    );
};
