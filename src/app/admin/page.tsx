import React from "react";
import { isAuthed } from "../../lib/auth";
import { getStore } from "../../lib/overrides";
import LoginForm from "./LoginForm";
import AdminEditor from "./AdminEditor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAuthed();

  if (!authenticated) {
    return <LoginForm />;
  }

  // Load configuration overrides and custom sectors
  const store = await getStore();

  return <AdminEditor initialStore={store} />;
}
