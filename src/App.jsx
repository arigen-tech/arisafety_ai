import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Pending } from "./pages/Pending";
import { Approved } from "./pages/Approved";
import { Rejected } from "./pages/Rejected";
import { Reports } from "./pages/Reports";
import { ErrorPage } from "./pages/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <Layout />,
    // errorElement: <ErrorPage />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/pending",
        element: <Pending />,
      },
      {
        path: "/approved",
        element: <Approved />,
      },
      {
        path: "/rejected",
        element: <Rejected />,
      },
      {
        path: "/reports",
        element: <Reports />,
      },

      {
        path: "*",
        element: <ErrorPage />,
      },

    ]
  }

]);



function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;
