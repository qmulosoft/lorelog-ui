import Nav from "react-bootstrap/Nav";
import {
    useHistory
} from "react-router-dom";
import NavDropdown from "react-bootstrap/NavDropdown";
import React, {Dispatch} from "react";
import {Navbar} from "react-bootstrap";
import logo from "../../logo.svg";
import {Claims} from "../../types/claims";

export interface NavBarProps {
    jwt: string,
    setJwt: Dispatch<string>
    claims?: Claims
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
            <Navbar collapseOnSelect expand="lg" bg="light" sticky="top">
                <Navbar.Brand>
                    <img src={logo} className="App-logo" alt=""/>
                    Lore Log
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav defaultActiveKey="profile" onSelect={handleSelect} justify variant="pills">
                        <Nav.Item>
                            <Nav.Link eventKey="/characters">
                                Characters
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="/factions">
                                Factions
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="/places">
                                Places
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="/things">
                                Items
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="/chronicle">
                                Chronicle
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        { props.claims ? "Campaign: " + props.claims.campaigns[props.claims.selected_campaign]
                            : null
                        }
                    </Navbar.Text>
                    <Nav onSelect={handleSelect}>
                        <NavDropdown id="account-dropdown" title="Account">
                            <NavDropdown.Item eventKey="/profile">Profile</NavDropdown.Item>
                            <NavDropdown.Item eventKey="/logout">Logout</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
        </Navbar>
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