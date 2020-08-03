import React, {useContext, useEffect, useState} from "react";
import {useRouteMatch, useHistory} from "react-router-dom"
import {Button, Col, Form, InputGroup, Row, Table} from "react-bootstrap";
import {appContext} from "../App";
import {FormTextCheckbox} from "./shared_checkbox_formtext";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export interface RelationsTableProps {
    stringFields?: string[]
}

interface Relation {
    primary_id: string,
    relation_id: string,
    relation_name?: string,
    is_public: boolean,
    string_fields: {[key: string]: string}
    creator_id?: string
}

interface RelationData {
    id: string,
    name: string,
}

export const RelationsTable = (props: RelationsTableProps) => {
    const match = useRouteMatch("/:this/:id/:that") as any;
    const relationType = match?.params?.that;
    const history = useHistory();
    const [rows, setRows] = useState<Array<Relation>>([]);
    const [fetched, setFetched] = useState(false);
    const [activeData, setActiveData] = useState<Relation>({
        primary_id: match?.params?.id || "",
        relation_id: "",
        is_public: false,
        string_fields: {}
    });
    const [relations, setRelations] = useState<Array<RelationData>>([]);
    const {apiFetch, claims} = useContext(appContext);
    const singleThatName = relationType?.substring(0, 1).toUpperCase() + relationType?.substring(1, relationType?.length-1);

    const getRelations = async () => {
        const res = await apiFetch(`${match?.params?.that}`);
        if (res.status === 200) {
            setRelations(await res.json());
        } else {
            console.log(res.status);
            console.error(await res.json());
        }
    }

    const getRelationRows = async () => {
        setFetched(true);
        const res = await apiFetch(`${match?.params?.this}/${match?.params?.id}/relations/${match?.params?.that}`);
        const data = await res.json() as any[];
        const rows = [] as Array<Relation>;
        data.forEach(item => {
            const row = {} as Relation;
            row.is_public = item.is_public;
            row.relation_id = item.relation_id;
            row.relation_name = item.relation_name;
            row.string_fields = {};
            row.creator_id = item.creator_id;
            props.stringFields?.forEach(field => {
                row.string_fields[field] = item[field];
            });
            rows.push(row);
        });
        setRows(rows);
        getRelations();
    }

    const deleteRelation = async (relationId: string) => {
        const res = await apiFetch(`${match?.params?.this}/${match?.params?.id}/relations/${match?.params?.that}/${relationId}`,
            {"method": "DELETE"});
        if (res && res.status === 204) {
            getRelationRows();
        }
    }

    const addRelation = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const reqData = {} as any;
        reqData.relation_id = activeData.relation_id;
        reqData.is_public = activeData.is_public;
        Object.keys(activeData.string_fields).forEach(field => {
            reqData[field] = activeData.string_fields[field];
        })
        const res = await apiFetch(`${match?.params?.this}/${match?.params?.id}/relations/${match?.params?.that}`,
            {
                'method': "post",
                'body': JSON.stringify(reqData)
            }
            );
        if (res && res.status === 201) {
            setActiveData({
                primary_id: match?.params?.id || "",
                relation_id: "",
                is_public: false,
                string_fields: {}
            });
            getRelationRows();
        }
    }

    const getFormValue = (element: HTMLInputElement): boolean|string|number => {
        if (element.type === "checkbox") {
            return element.checked;
        } else {
            return element.value;
        }
    };

    const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
        const target = event.target as HTMLInputElement;
        const copy = {...activeData};
        //@ts-ignore
        let key = target.id
        if (key.includes(":")) {
            key = key.split(":")[1];
        }
        if (props.stringFields && props.stringFields.includes(key)) {
            copy.string_fields[key] = target.value;
        } else {
            //@ts-ignore
            copy[key] = getFormValue(target);
        }
        setActiveData(copy);
    }

    useEffect(() => {
        if (match?.params?.that && !fetched) {
            getRelationRows();
        }
        if (match?.params?.id && !activeData.primary_id) {
            const data = {...activeData};
            data.primary_id = match.params.id;
            setActiveData(data);
        }
    }, [match])

    // @ts-ignore
    return (
        <div className="Table-page">
            <p className="Form-header">{singleThatName} Relationships</p>
            <Form onSubmit={addRelation} onChange={handleChange}>
                <p className="Form-subheader">Add new relationship</p>
                <div className="responsiveFormColumn">
                    <Form.Group>
                        <InputGroup>
                            <InputGroup.Prepend>
                                <InputGroup.Text as={Form.Label}>
                                    {singleThatName}
                                </InputGroup.Text>
                            </InputGroup.Prepend>
                            <Form.Control as="select" id="relation_id" value={activeData.relation_id} required>
                                { <option/> }
                                { relations.map(relation => <option value={relation.id} label={relation.name}/>)}
                            </Form.Control>
                        </InputGroup>
                        <FormTextCheckbox checked={activeData.is_public} canEdit={true} scope={singleThatName}/>
                    </Form.Group>
                </div>
                <div className="responsiveFormColumn">
                    <Form.Group as={Row}>
                        {props.stringFields ? props.stringFields.map(field =>
                            <Col xs={12} lg={6}>
                                <InputGroup>
                                    <InputGroup.Prepend>
                                        <InputGroup.Text as={Form.Label}>
                                            {field}
                                        </InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <Form.Control type="text" id={field} value={activeData.string_fields[field]}/>
                                </InputGroup>
                            </Col>)
                        : null }
                    </Form.Group>
                </div>
                <div className="responsiveFormColumn">
                    <Form.Group>
                        <Button type="submit">Add</Button>
                    </Form.Group>
                </div>
            </Form>
            <Table striped bordered hover className="table-list">
                <thead>
                    <tr>
                        <th>
                            {match?.params?.that.substring(0, match?.params?.that.length-1)} name
                        </th>
                        {props.stringFields?.map(field =>
                            <th>
                                {field}
                            </th>
                        )}
                        <th className="col-1">
                            shared
                        </th>
                        <th className="col-1">
                            actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                {rows.map(row =>
                    <tr onClick={() => {
                        history.push(`/${match.params.that}/${row.relation_id}`)
                    }}>
                        <td>{row.relation_name}</td>
                        {props.stringFields?.map(field =>
                            <td>
                                {
                                    row.string_fields[field]
                                }
                            </td>
                        )}
                        <td>{row.is_public ? "yes" : "no"}</td>
                        <td>
                            {row.creator_id === claims.id ?
                            <FontAwesomeIcon icon={faTrash} onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                deleteRelation(row.relation_id);
                            }}/>
                            : null }
                        </td>
                    </tr>
                )}
                </tbody>
            </Table>
        </div>
    )
}