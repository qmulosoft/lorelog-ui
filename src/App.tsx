import React, {createContext, Dispatch, useEffect, useState} from 'react';
import './App.css';
import {RegisterForm} from "./components/register/register"
import {LoginForm} from "./components/login/login";
import {NavBar} from "./components/nav/nav";
import jwtlib from "jsonwebtoken";
import {BrowserRouter as Router, Route, Switch,} from "react-router-dom";
import {Claims} from "./types/claims";
import {Profile} from "./components/profile/profile";
import {CharacterList} from "./components/characters/character_list";
import {CharacterForm} from "./components/characters/character";
import {FactionList} from "./components/factions/faction_list";
import {FactionForm} from "./components/factions/faction";
import {Page} from "./components/page/page";
import {PlaceForm, PlaceType} from "./components/places/place";
import {PlaceList} from "./components/places/place_list";
import {ThingList} from "./components/things/thing_list";
import {ThingForm} from "./components/things/thing";
import {ChronicleEntryType, ChronicleList, ChronicleSummary} from "./components/chronicle/chronicle_list";
import {ChronicleForm} from "./components/chronicle/chronicle";

const localStorageJWTKey = "com.qmulosoft.ll.jwt"

export interface AppContext {
    apiFetch: Function
    claims: Claims
}

export const appContext = createContext<AppContext>(
    { // the default value is used by unauthenticated routes (login, register)
        apiFetch: (path: string, init: RequestInit) => {
            let hostname = window.location.hostname;
            // TODO find a better way of handling dev vs prod api routing
            if (!hostname.startsWith("localhost")) {
               hostname += "/api"
            } else {
                hostname += ":4242"
            }
            const proto = window.location.protocol;
            return fetch(`${proto}//${hostname}/${path}`, init);
        },
        //@ts-ignore
        claims: {}
    });

const tempEntries = [{
    id: "1",
    title: "Big Bad Evil Guy Finally Revealed",
    relation_type: "character",
    is_public: false,
}, {
    id: "2",
    title: "Legendary Sword of Poo discovered!",
    relation_type: "thing",
    is_public: true
}] as ChronicleSummary[]

function App() {
    const [jwt, setJwt] = useState(localStorage.getItem(localStorageJWTKey) || "");
    const [claims, setClaims] = useState<Claims|undefined>(undefined);
    useEffect(() => {
        const decoded = jwtlib.decode(jwt) as Claims;
        if (null !== decoded) {
            decoded.token = jwt;
            localStorage.setItem(localStorageJWTKey, jwt);
        }
        setClaims(decoded);
    }, [jwt]);

    const apiFetch = async (route: string, init?: RequestInit, setError?: Dispatch<string>) => {
        let hostname = window.location.hostname;
        // TODO find a better way of handling dev vs prod api routing
        if (!hostname.startsWith("localhost")) {
            hostname += "/api"
        } else {
            hostname += ":4242"
        }
        const proto = window.location.protocol;
        if (!init) {
            init = {};
        }
        init.headers = new Headers({
           "Authorization": `jwt ${jwt}`,
           "Content-Type": "application/json"
        });
        try {
            const res = await fetch(`${proto}//${hostname}/${route}`, init);
            if (res.status === 401) {
                localStorage.removeItem(localStorageJWTKey);
                setJwt("");
            }
            return res;
        } catch(e) {
            if (setError) {
                console.error(e);
                setError(e.message);
            }
        }
    }

    return (
      <Router>
        <div className="App">
          <header className="App-header">
              <NavBar jwt={jwt} setJwt={setJwt} claims={claims}/>
          </header>
            { claims ?
            <appContext.Provider value={{apiFetch, claims}}>
            <div className="App-content">
              <Switch>
                  <Route path="/new/character">
                      <CharacterForm/>
                  </Route>
                  <Route path="/new/faction">
                      <FactionForm/>
                  </Route>
                  <Route path="/new/place">
                      <PlaceForm/>
                  </Route>
                  <Route path="/new/thing">
                      <ThingForm/>
                  </Route>
                  <Route path="/chronicle/:chronicleID">
                      <ChronicleForm type={ChronicleEntryType.Domain}/>
                  </Route>
                  <Route path="/chronicle">
                      <ChronicleList/>
                  </Route>
                  <Route path="/characters/:id">
                      <Page form={CharacterForm} double relations={{"factions": {name: "Factions", string_fields: ["role", "reputation"]}}}/>
                  </Route>
                  <Route path="/characters">
                      <CharacterList/>
                  </Route>
                  <Route path="/factions/:id">
                      <Page form={FactionForm} />
                  </Route>
                  <Route path="/factions">
                      <FactionList/>
                  </Route>
                  <Route path="/places/:id">
                      <Page form={PlaceForm}/>
                  </Route>
                  <Route path="/places">
                      <PlaceList/>
                  </Route>
                  <Route path="/domain">
                      <PlaceForm type={PlaceType.DOMAIN}/>
                  </Route>
                  <Route path="/things/:id">
                      <Page form={ThingForm}/>
                  </Route>
                  <Route path="/things">
                      <ThingList/>
                  </Route>
                  <Route path="/logout">
                  </Route>
                  <Route path="/profile">
                      <Profile setJwt={setJwt}/>
                  </Route>
              </Switch>
              </div>
            </appContext.Provider>
            : <Switch>
                <Route path="/register">
                    <RegisterForm/>
                </Route>
                <Route>
                    <LoginForm setJwt={setJwt} jwt={jwt}/>
                </Route>
            </Switch>
            }
        </div>
      </Router>
    );
}

export default App;
