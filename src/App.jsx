import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { ObservationManagement } from "./pages/ObservationManagement";
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
        path: "/observation-management",
        element: <ObservationManagement />,
      },
      {
        // path: "/contact",
        // element: <Contact />,
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
