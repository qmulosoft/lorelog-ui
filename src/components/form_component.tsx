import React, {Dispatch} from "react";
import { Claims } from "../types/claims";
import Form from "react-bootstrap/Form"

export interface FormProps<D extends FormData> {
    claims: Claims
    resourceName: string
    setSuccess?: Dispatch<string>
    setFailure?: Dispatch<string>
    setCanEdit: Dispatch<boolean>
    getData: Function
    setData: Dispatch<D>
    dataId?: string|number
    apiFetch: Function
}

export interface FormData {
    creator_id?: string
    campaign_id?: number
}

export interface FormState {
    isNew: boolean
}

export default class LoreForm<D> extends React.Component<FormProps<D>, FormState> {

    constructor(props: FormProps<D>) {
        super(props);
        this.state = {
            isNew: false,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.getFormValue = this.getFormValue.bind(this);
        this.getData = this.getData.bind(this);
        this.update = this.update.bind(this);
        this.create = this.create.bind(this);
    }

    componentDidMount() {
        if (this.props.dataId === undefined || this.props.dataId === null || this.props.dataId === "new") {
            this.setState({
                isNew: true,
            });
        } else {
            this.getData();
        }
    }

    async getData() {
        const res = await this.props.apiFetch(`${this.props.resourceName}/${this.props.dataId}`, {}, this.props.setFailure);
        const json = await res.json();
        this.props.setData(json);
        const data = this.props.getData();
        if (data.creator_id === this.props.claims.id) {
            this.props.setCanEdit(true);
        }
    }

    getFormValue(element: HTMLInputElement): boolean|string|number {
        if (element.type === "checkbox") {
            return element.checked;
        } else {
            return element.value;
        }
    };

    handleUpdate(event: React.FormEvent<HTMLFormElement>) {
        const target = event.target as HTMLInputElement;
        const copy = {...this.props.getData()} as any;
        //@ts-ignore
        if (!target.id) {
            return;  // we assume this is externally managed state (like rich text, etc)
        }
        //@ts-ignore
        let key = target.id
        if (key.includes(":")) {
            key = key.split(":")[1];
        }
        copy[key] = this.getFormValue(target);
        this.props.setData(copy);
    }

    componentDidUpdate(prevProps: Readonly<FormProps<D>>, prevState: Readonly<FormState>, snapshot?: any) {
        if (prevProps.dataId !== this.props.dataId) {
            if (this.props.dataId && this.props.dataId !== "new") {
                this.getData();
                this.setState({isNew: false});
            }
        }
    }

    async create() {
        const res = await this.props.apiFetch(`${this.props.resourceName}`, {
            method: "post",
            body: JSON.stringify(this.props.getData())
        }, this.props.setFailure);
        if (!res) {
            // errors would have already been handled by the apiFetch method
            return;
        }
        if (res.status === 201 && this.props.setSuccess) {
            this.props.setSuccess(`Successfully created new ${this.props.resourceName}`)
        } else if (this.props.setFailure) {
            const resp = await res.json();
            this.props.setFailure(resp.title);
        }
    }

    async update() {
        const res = await this.props.apiFetch(`${this.props.resourceName}/${this.props.dataId}`, {
            method: "PATCH",
            body: JSON.stringify(this.props.getData())
        });
        if (res.status === 200 && this.props.setSuccess) {
            this.props.setSuccess(`Saved Successfully`)
            setTimeout(() => {
                this.props.setSuccess && this.props.setSuccess("")
            }, 2000);
        } else if (this.props.setFailure) {
            const json = await res.json();
            if (json.title) {
                this.props.setFailure(json.title)
            }
        }
    }

    handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (this.state.isNew) {
            this.create();
        } else {
            this.update();
        }
    }

    render() {
        return (<Form onSubmit={this.handleSubmit} onChange={this.handleUpdate}>
            {this.props.children}
        </Form>);
    }
}
