export interface Campaign {
    id: number,
    name: string,
    description?: string
}

export interface Claims {
    alias: string,
    email: string,
    id: string,
    exp: number,
    campaigns: {[id: string]: string},
    selected_campaign: string,
    token: string
}