import { createBrowserRouter } from "react-router"
import AppShell from "./AppShell"
import PageLoader from "./PageLoader"
import RouteErrorPage, { NotFoundPage } from "./RouteErrorPage"
import HomePage from "../features/home/HomePage"

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: "piece-taking",
            lazy: async () => ({ Component: (await import("../features/piece-taking")).default }),
          },
          {
            path: "strange-othello",
            lazy: async () => ({ Component: (await import("../features/strange-othello")).default }),
          },
          {
            path: "mod-m",
            lazy: async () => ({ Component: (await import("../features/mod-m")).default }),
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
