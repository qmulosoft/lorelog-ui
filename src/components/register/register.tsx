import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import React, {ChangeEvent, useContext, useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import {appContext} from "../../App";

interface Captcha {
    id: string,
    question: string,
    pending: boolean
}

export function RegisterForm() {
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [captcha, setCaptcha] = useState<Captcha>({
        id: "",
        question: "",
        pending: true
    });
    const history = useHistory();
    const {apiFetch} = useContext(appContext);
    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.currentTarget.value);
    };
    const handleConfirmChange = (event: ChangeEvent<HTMLInputElement>) => {
        setConfirm(event.currentTarget.value);
    };

    const getCaptcha = async () => {
        const res = await apiFetch("captcha", {method: "post"})
        const body = await res.json();
        setCaptcha({
            id: body.id,
            question: body.question,
            pending: false
        });
    };

    useEffect(() => {
        if (password !== confirm) {
            setPasswordsMatch(false);
        } else {
            setPasswordsMatch(true);
        }
    }, [password, confirm]);

    useEffect(() => {
        getCaptcha();
    }, [error]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        const form = {
            email: String,
            password: String,
            alias: String,
            captcha: {},
            code: String
        };
        // @ts-ignore
        for (let input of event.currentTarget) {
            if (input.id === "email") {
                form.email = input.value;
            } else if (input.id === "alias") {
                form.alias = input.value;
            } else if (input.id === "password") {
                form.password = input.value;
            } else if (input.id === "captcha") {
                form.captcha = {
                    id: captcha.id,
                    answer: input.value
                }
            } else if (input.id === "code") {
                form.code = input.value;
            }
        }
        try {
            const res = await apiFetch("users", {
                "method": "post",
                "body": JSON.stringify(form),
                "headers": new Headers({"content-type": "application/json"})
            });
            if (res.status !== 201) {
                let error = await res.json();
                setError(error.title);
            } else {
                setSuccess("User successfully created. You may now login");
                history.push("/login");
            }
        } catch (e) {
            setError(e.message);
        }
    }
    return (
    <Form className="columnForm" onSubmit={handleSubmit}>
        <p className="Form-header">Create Account</p>
        { error ? <p className="Form-error">{error}</p> : null }
        { success ? <p className="Form-success">{success}</p> : null }
        <Form.Group controlId="email">
            <Form.Label>Email Address</Form.Label>
            <Form.Control type="text" placeholder="example@domain.com" required maxLength={128}/>
        </Form.Group>
        <Form.Group controlId="alias">
            <Form.Label>Player Name</Form.Label>
            <Form.Control type="text" placeholder="DuBizzle" required maxLength={64}/>
        </Form.Group>
        <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" required onChange={handlePasswordChange}/>
            <Form.Text>Your password will be encrypted and secure</Form.Text>
        </Form.Group>
        <Form.Group controlId="confirm">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" required isInvalid={!passwordsMatch} onChange={handleConfirmChange}/>
            <Form.Text>Re-enter your password from above to confirm</Form.Text>
            <Form.Control.Feedback type="invalid">Passwords Must Match</Form.Control.Feedback>
        </Form.Group>
        <Form.Group controlId="captcha">
            <Form.Label>Verify You're a Human (Captcha)</Form.Label>
            <Form.Control type="text" placeholder="e.g. cathat"></Form.Control>
            <Form.Text>Enter the first two three letter words from the letters: {captcha.pending? "..." : captcha.question}</Form.Text>
        </Form.Group>
        <Form.Group controlId="code">
            <Form.Label>Referral Code</Form.Label>
            <Form.Control type="text"/>
            <Form.Text>This is currently required. If you don't have a referral code, you can't yet create an account</Form.Text>
        </Form.Group>
        <Form.Group>
            <Button variant="primary" type="submit">Register</Button>
        </Form.Group>
    </Form>
    );
}