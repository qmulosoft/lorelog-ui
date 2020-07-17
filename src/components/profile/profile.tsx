import default_avatar from "../../assets/silhouette_soldier.svg";
import Image from "react-bootstrap/Image";
import React, {Dispatch, SyntheticEvent, useContext, useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import {ListGroup} from "react-bootstrap";
import {appContext} from "../../App";

export interface ProfileData {
    image?: string,
    timezone?: string,
    status?: string
}

export interface ProfileProps {
    setJwt: Dispatch<string>
}

// This is still not using the standard LoreForm component because of the temporary "show my own profile" behavior
export function Profile(props: ProfileProps) {
    const [profile, setProfile] = useState<ProfileData>({
        status: "Loading...",
        timezone: "Loading..."
    });
    const [fetched, setFetched] = useState(false);
    const [error, setError] = useState<string>("");
    const {claims, apiFetch} = useContext(appContext);

    const fetchProfile = async () => {
        const res = await apiFetch(`profile/${claims.id}`);
        if (res) {
            if (res.status !== 200) {
                console.log(res.statusText);
                setError("An error occurred loading profile data");
                return;
            }
            const profile = await res.json();
            setProfile(profile);
        }
    };

    useEffect(() => {
        if (!fetched) {
            fetchProfile();
            setFetched(true);
        }
    });
    useEffect(() => {
    }, [profile])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = {} as ProfileData;
        // @ts-ignore
        for (const element of event.currentTarget) {
            if (element.id === "timezone") {
                form.timezone = element.value;
            } else if (element.id === "status") {
                form.status = element.value;
            }
        }
        const res = await apiFetch(`profile`, {
            "method": "PATCH",
            "body": JSON.stringify(form),
        });
        if (res) {
            const json = await res.json();
            if (res.status !== 200) {
                setError(json.title);
                return;
            }
        }
    };

    const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        const copy = {...profile} as any;
        copy[target.id] = target.value;
        setProfile(copy);
    }

    const switchCampaigns = async (newCampaign: string) => {
        const res = await apiFetch(`profile/campaigns/${newCampaign}`, {method: "post"});
        if (res) {
            const body = await res.json();
            props.setJwt(body.jwt);
        }
    }

    const campaignList = Object.keys(claims.campaigns).map((key) =>
       <ListGroup.Item key={key} href={`/campaigns/${key}`} action onClick={(event: SyntheticEvent) => {
           event.preventDefault();
           switchCampaigns(key);
       }}>{claims.campaigns[key]}</ListGroup.Item>
    );

    return (
        <Form className="columnForm" onSubmit={handleSubmit}>
            <span className="Form-header">User Profile</span>
            <div className="Profile-summary">
                <div className="Profile-img-surround">
                    <Image className="Profile-img-full" src={default_avatar} alt="avatar" rounded/>
                </div>
                <Form.Group as={Row} controlId="alias">
                    <Form.Label column sm="2">Name</Form.Label>
                    <Col sm="10">
                        <Form.Control plaintext readOnly type="text" value={claims.alias} maxLength={64}/>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="email">
                    <Form.Label column sm="2">Email</Form.Label>
                    <Col sm="10">
                        <Form.Control readOnly plaintext type="text" value={claims.email} maxLength={128}/>
                    </Col>
                </Form.Group>
                <Form.Group as={Row} controlId="timezone">
                    <Form.Label column sm="3">Timezone</Form.Label>
                    <Col sm="9">
                        <Form.Control type="text" value={profile.timezone} maxLength={16} onChange={handleUpdate}/>
                    </Col>
                </Form.Group>
            </div>

            <Form.Group controlId="status">
                <Form.Label>Status Message</Form.Label>
                <Form.Control type="text" value={profile.status} maxLength={128} onChange={handleUpdate} />
            </Form.Group>
            {error ? <span className="Form-error">{error}</span> : null }
            <Button type="submit" variant="primary">Update</Button>
            <Form.Group>
                <Form.Label className="Form-header">Campaigns</Form.Label>
                <ListGroup variant="flush" defaultActiveKey={`/campaigns/${claims.selected_campaign}`}>
                    {campaignList}
                </ListGroup>
            </Form.Group>
        </Form>
    );
}