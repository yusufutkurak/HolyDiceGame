import { AuthClient } from "@dfinity/auth-client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { canisterId, createActor } from "../../../../declarations/game_room_backend";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const getIdentityProvider = () => {
  let idpProvider;
  if (typeof window !== "undefined") {
    const isLocal = process.env.DFX_NETWORK !== "ic"; // Localde mi kontrolü
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isLocal && isSafari) {
      idpProvider = `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`;
    } else if (isLocal) {
      idpProvider = `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;
    } else {
      // Mainnet için doğru URL'yi kullan
      idpProvider = `https://identity.ic0.app`;  // Mainnet URL
    }
  }
  return idpProvider;
};


export const defaultOptions = {
  createOptions: {
    idleOptions: {
      disableIdle: true,
    },
  },
  loginOptions: {
    identityProvider: getIdentityProvider(),
  },
};

export const useAuthClient = (options = defaultOptions) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [game_roomActor, setgame_roomActor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    AuthClient.create(options.createOptions).then(async (client) => {
      await updateClient(client);
    });
  }, []);

  useEffect(() => {
    const savedIsAuthenticated = localStorage.getItem("isAuthenticated");
    if (savedIsAuthenticated === "true") {
      AuthClient.create(options.createOptions).then(async (client) => {
        await updateClient(client);
      });
    }
  }, []);

  const login = () => {
    authClient.login({
      ...options.loginOptions,
      onSuccess: () => {
        updateClient(authClient);
        window.location.href = "/profile";
      },
    });
  };

  async function updateClient(client) {
    const isAuthenticated = await client.isAuthenticated();
    setIsAuthenticated(isAuthenticated);
    localStorage.setItem("isAuthenticated", isAuthenticated);

    const identity = client.getIdentity();
    setIdentity(identity);

    const principal = identity.getPrincipal();
    setPrincipal(principal);

    setAuthClient(client);

    const actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });

    setgame_roomActor(actor);
  }

  async function logout() {
    await authClient?.logout();
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  }

  return {
    isAuthenticated,
    login,
    logout,
    authClient,
    identity,
    principal,
    game_roomActor,
  };
};

export const AuthProvider = ({ children }) => {
  const auth = useAuthClient();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
