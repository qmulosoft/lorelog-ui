import Nav from "react-bootstrap/Nav";
import {
    useHistory
} from "react-router-dom";
import NavDropdown from "react-bootstrap/NavDropdown";
import React, {Dispatch} from "react";

export interface NavBarProps {
    jwt: string,
    setJwt: Dispatch<string>
}

export function NavBar(props: NavBarProps) {
    const history = useHistory();
    const handleSelect = (key: string | null) => {
        if (key) {
            if (key === "/logout") {
                props.setJwt("");
                history.push("/login");
            } else {
                history.push(key);
            }
        }
    };
    if (props.jwt) {
        return (
            <Nav defaultActiveKey="register" variant="pills" onSelect={handleSelect}>
                <NavDropdown id="account-dropdown" title="People">
                    <NavDropdown.Item eventKey="/characters">Characters</NavDropdown.Item>
                    <NavDropdown.Item eventKey="/factions">Factions</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown id="account-dropdown" title="Places">
                    <NavDropdown.Item eventKey="/domain">Domain</NavDropdown.Item>
                    <NavDropdown.Item eventKey="/places">All Places</NavDropdown.Item>
                </NavDropdown>
                <Nav.Item>
                    <Nav.Link eventKey="/things">Things</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="/chronicle">Chronicle</Nav.Link>
                </Nav.Item>
                <NavDropdown id="account-dropdown" title="Account">
                    <NavDropdown.Item eventKey="/profile">Profile</NavDropdown.Item>
                    <NavDropdown.Item eventKey="/logout">Logout</NavDropdown.Item>
                </NavDropdown>
            </Nav>
        );
    }
    return (<Nav defaultActiveKey="register" variant="pills" onSelect={handleSelect}>
        <Nav.Item>
            <Nav.Link eventKey="/login">Login</Nav.Link>
        </Nav.Item>
        <Nav.Item>
            <Nav.Link eventKey="/register">Create Account</Nav.Link>
        </Nav.Item>
    </Nav>);
}