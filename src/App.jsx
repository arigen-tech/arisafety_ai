import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Pending } from "./pages/Pending";
import { Approved } from "./pages/Approved";
import { Rejected } from "./pages/Rejected";
import { Reports } from "./pages/Reports";
import { ErrorPage } from "./pages/ErrorPage";
import { ObservationDetails } from "./pages/ObservationDetails";
import { UsersRole } from "./pages/UsersRole";
import { ApprovedObservationDetails } from "./pages/ApprovedObservationDetails";
import { RejecedObservationDetails } from "./pages/RejecedObservationDetails";
import { Profile } from "./pages/Profile";

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
        path: "/observation-details",
        element: <ObservationDetails />,
      },
      {
        path: "/approved-observation-details",
        element: <ApprovedObservationDetails />,
      },
      {
        path: "/rejected-observation-details",
        element: <RejecedObservationDetails />,
      },
      {
        path: "/manage-userRole",
        element: <UsersRole />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      

      {
        path: "*",
        element: <ErrorPage />,
      },

    ]
  }

]);


// manage-userRole

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;
