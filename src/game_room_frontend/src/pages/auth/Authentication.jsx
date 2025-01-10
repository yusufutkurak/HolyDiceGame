import React from "react";
import LoggedOut from "./LoggedOut";
import LoggedIn from "./LoggedIn";
import { useAuth, AuthProvider } from "./useAuthClient";

function Authentication() {
  const { isAuthenticated, identity } = useAuth();
  return (
    <>
      <header id="header">
        <section id="status" className="toast hidden">
          <span id="content"></span>
        </section>
      </header>
      <main id="pageContent">
        {isAuthenticated ? <LoggedIn /> : <LoggedOut />}
      </main>
    </>
  );
}

export default () => (
  <AuthProvider>
    <Authentication />
  </AuthProvider>
);