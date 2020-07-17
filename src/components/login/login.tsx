import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import React, {Dispatch, useContext, useState} from "react";
import {Link} from "react-router-dom";
import {appContext} from "../../App";

export interface LoginFormProps {
    setJwt: Dispatch<string>,
    jwt: string
}

export function LoginForm(props: LoginFormProps) {
    const [error, setError] = useState("");
    const {apiFetch} = useContext(appContext);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        const form = {
            email: String,
            password: String,
        };
        // @ts-ignore
        for (let input of event.currentTarget) {
            if (input.id === "email") {
                form.email = input.value;
            } else if (input.id === "password") {
                form.password = input.value;
            }
        }
        try {
            const res = await apiFetch("login", {
                "method": "post",
                "body": JSON.stringify(form),
                "headers": new Headers({"content-type": "application/json"})
            });
            if (res.status !== 200) {
                let error = await res.json();
                setError(error.title);
            } else {
                const body = await res.json()
                props.setJwt(body.jwt);
            }
        } catch (e) {
            setError(e.message);
        }
    }
    return (
      <Form className="columnForm" onSubmit={handleSubmit}>
          <p className="Form-header">Login</p>
          { error ? <p className="Form-error">{error}</p> : null}
          { props.jwt ? <p className="Form-success">You are logged in</p> : null }
          <Form.Group controlId="email">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="text" placeholder="example@domain.com" maxLength={128}/>
          </Form.Group>
          <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password"/>
              <Form.Text>Forgot your password? Tough. <Link to="/register">Create an account</Link>.</Form.Text>
          </Form.Group>
          <Button variant="primary" type="submit">Login</Button>
      </Form>
    );
}