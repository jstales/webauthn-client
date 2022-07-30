import { useEffect, useState } from "react";
import Button from "./components/Button";
import Header from "./components/Header";
import TextField from "./components/TextFields";

function checkSupport() {
  return (
    !!window.PublicKeyCredential &&
    !!window.navigator.credentials &&
    !!window.navigator.credentials.create
  );
}

function checkUVSupportedPlatform() {
  return window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
}

export default function App() {
  const [isClientSupported, setIsClientSupported] = useState(true);
  const [isUVPlatform, setIsUVPlatform] = useState(false);
  const [credential, setCredential] = useState(null);
  const [authResponse, setAuthResponse] = useState(null);
  const [theme, setTheme] = useState("Dark");
  const [email, setEmail] = useState(null);

  useEffect(() => {
    async function checkUVSupport() {
      setIsUVPlatform(await checkUVSupportedPlatform());
    }
    const supported = checkSupport();
    setIsClientSupported(supported);
    if (supported) {
      checkUVSupport();
    }
  }, []);

  const response = {
    id: "ADSUllKQmbqdGtpu4sjseh4cg2TxSvrbcHDTBsv4NSSX9...",
    rawId: ArrayBuffer(59),
    response: {
      authenticatorData: ArrayBuffer(191),
      clientDataJSON: ArrayBuffer(118),
      signature: ArrayBuffer(70),
      userHandle: ArrayBuffer(10),
    },
    type: "public-key",
  };

  console.log(response);
  return (
    <div className={theme === "Dark" ? "dark" : ""}>
      <div className="w-screen h-screen antialiased dark:text-slate-400 bg-white text-black dark:bg-slate-900">
        <Header
          onThemeToggle={(theme) => {
            setTheme(theme);
          }}
        />
        <main className="p-5 gap-10 flex items-center flex-col">
          <div className="w-5/12">
            <TextField
              id="email"
              name="email"
              label="Email Address"
              value={email}
              required={true}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
            <Button
              label="Login"
              disabled={!email}
              onClick={async () => {
                const existingCredentialId =
                  localStorage.getItem("credentialId");
                let authUrl = `http://localhost:8080/authenticate?email=${email}`;
                if (existingCredentialId) {
                  authUrl = `${authUrl}&credentialId=${existingCredentialId}`;
                }
                const response = await fetch(authUrl, {
                  credentials: "include",
                  method: "GET",
                }).then((res) => res.json());

                console.log("Server options", response);

                if (response && response.create && !response.login) {
                  const publicKeyOptions = response.options;

                  publicKeyOptions.challenge = window.base64url.decode(
                    publicKeyOptions.challenge
                  );

                  publicKeyOptions.user.id = window.base64url.decode(
                    publicKeyOptions.user.id
                  );

                  for (let cred of publicKeyOptions.excludeCredentials) {
                    cred.id = window.base64url.decode(cred.id);
                  }

                  console.log("PK options", publicKeyOptions);

                  const createCredentialResponse =
                    await navigator.credentials.create({
                      publicKey: publicKeyOptions,
                    });

                  console.log("Auth response", createCredentialResponse);
                  setCredential(createCredentialResponse);

                  const credential = {};
                  credential.id = window.base64url.encode(
                    createCredentialResponse.rawId
                  );
                  credential.rawId = window.base64url.encode(
                    createCredentialResponse.rawId
                  );
                  credential.type = createCredentialResponse.type;

                  if (createCredentialResponse.response) {
                    const clientDataJSON = window.base64url.encode(
                      createCredentialResponse.response.clientDataJSON
                    );
                    const attestationObject = window.base64url.encode(
                      createCredentialResponse.response.attestationObject
                    );
                    credential.response = {
                      clientDataJSON,
                      attestationObject,
                    };
                  }

                  localStorage.setItem(
                    "credentialId",
                    createCredentialResponse.id
                  );

                  console.log(credential);

                  const verificationResponse = await fetch(
                    "http://localhost:8080/create/verify",
                    {
                      method: "POST",
                      credentials: "include",
                      body: JSON.stringify(credential),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  ).then((res) => res.json());

                  console.log(verificationResponse);
                }

                if (response && response.login && !response.create) {
                  const publicKeyOptions = response.options;

                  publicKeyOptions.challenge = window.base64url.decode(
                    publicKeyOptions.challenge
                  );

                  for (let cred of publicKeyOptions.allowCredentials) {
                    cred.id = window.base64url.decode(cred.id);
                  }

                  console.log("PK options", publicKeyOptions);

                  const getCredentialResponse = await navigator.credentials.get(
                    {
                      publicKey: publicKeyOptions,
                    }
                  );

                  console.log("Login response", getCredentialResponse);
                  setAuthResponse(getCredentialResponse);

                  const credential = {};
                  credential.id = getCredentialResponse.id;
                  credential.type = getCredentialResponse.type;
                  credential.rawId = window.base64url.encode(
                    getCredentialResponse.rawId
                  );

                  if (getCredentialResponse.response) {
                    const clientDataJSON = window.base64url.encode(
                      getCredentialResponse.response.clientDataJSON
                    );
                    const authenticatorData = window.base64url.encode(
                      getCredentialResponse.response.authenticatorData
                    );
                    const signature = window.base64url.encode(
                      getCredentialResponse.response.signature
                    );
                    const userHandle = window.base64url.encode(
                      getCredentialResponse.response.userHandle
                    );
                    credential.response = {
                      clientDataJSON,
                      authenticatorData,
                      signature,
                      userHandle,
                    };
                  }

                  const verificationResponse = await fetch(
                    "http://localhost:8080/login/verify",
                    {
                      method: "POST",
                      credentials: "include",
                      body: JSON.stringify(credential),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  ).then((res) => res.json());

                  console.log(verificationResponse);
                }
              }}
            ></Button>
          </div>

          {credential && <h4>Credential created with ID {credential.id}</h4>}
          {authResponse && <h4>Authenticated with ID {authResponse.id}</h4>}

          <p className="italic text-md">
            Web Authentication is{" "}
            {!isClientSupported ? "NOT Supported" : "Supported"} by your
            browser. Your device has {!isUVPlatform ? "NO" : ""} in-built
            authentication platform.
          </p>
        </main>
      </div>
    </div>
  );
}
