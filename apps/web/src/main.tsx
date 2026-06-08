import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./routes/App";
import { Dashboard } from "./routes/Dashboard";
import { PublicSite } from "./routes/PublicSite";
import { ResetPassword } from "./routes/ResetPassword";
import "./styles/branding.css";
import "./styles/index.css";
import "./styles/public.css";
import "./styles/dashboard-branding.css";
import "./styles/dashboard.css";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <PublicSite /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "reset-password", element: <ResetPassword /> }
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
