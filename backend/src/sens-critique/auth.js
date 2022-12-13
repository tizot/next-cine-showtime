import fetch from "node-fetch";
import process from "process";
import { isAfter } from "date-fns";

const FIREBASE_REST_API = "https://identitytoolkit.googleapis.com/v1/accounts";
const API_KEY = "AIzaSyAHxGE6otUcjogt6EXNzXrAZJr99WZ1MdI";

class SensCritiqueAuth {
  /**
   * @param {string} email
   * @param {string} password
   */
  constructor(email, password) {
    this._token = null;
    this._email = email;
    this._password = password;
  }

  async getToken() {
    await this._refresh();
    return this._token;
  }

  refresh() {
    this._refresh();
  }

  async _refresh(force = false) {
    if (!force && !this._has_token_expired()) return;

    console.log("Refreshing SC token");
    const url = `${FIREBASE_REST_API}:signInWithPassword?key=${API_KEY}`;
    const headers = { "content-type": "application/json; charset=UTF-8" };
    const body = JSON.stringify({
      email: this._email,
      password: this._password,
      returnSecureToken: true,
    });
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });
    if (response.status !== 200) {
      throw new Error(await response.text());
    }
    const data = await response.json();
    this._token = data.idToken;
  }

  _has_token_expired() {
    if (this._token === null) return true;
    const claims = JSON.parse(
      Buffer.from(this._token.split(".")[1] + "==", "base64").toString("ascii")
    );
    const expirationSeconds = claims["exp"];
    if (expirationSeconds) {
      if (isAfter(expirationSeconds * 1000, new Date())) {
        return false;
      }
    }
    return true;
  }
}

export default new SensCritiqueAuth(
  "masset.camille_senscritique@gmail.com",
  process.env.SC_PASSWORD
);
