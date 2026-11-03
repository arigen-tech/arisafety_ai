import { useEffect, useState } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
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
import { AssignedObservation } from "./pages/AssignedObservation";
import { PendingAssignedObservation } from "./pages/PendingAssignedObservation";
import { Assigned } from "./pages/Assigned";
import { AssignedObservationDetails } from "./pages/AssignedObservationDetails";
import { AssignedObservationSubmission } from "./pages/AssignedObservationSubmission";
import { ChatBot } from "./components/layout/ChatBot";
import { Loading } from "./components/layout/Loading";
import { getRequest } from "./service/apiService";
import { clearAuthSession } from "./service/authService";
import { ENDPOINTS } from "./config/apiConfig";

const AuthenticatedApp = () => {
  const [status, setStatus] = useState("checking");
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      if (!localStorage.getItem("token")) {
        if (active) setStatus("unauthenticated");
        return;
      }

      try {
        await getRequest(ENDPOINTS.AUTH_PROFILE);
        if (active) setStatus("authenticated");
      } catch (requestError) {
        if (!active) return;

        if (requestError.status === 401 || requestError.status === 403) {
          clearAuthSession();
          setStatus("unauthenticated");
          return;
        }

        setError("Unable to verify your session. Check your connection and try again.");
        setStatus("error");
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, [retryCount]);

  if (status === "checking") return <Loading />;
  if (status === "unauthenticated") {
    return <Navigate to="/" replace />;
  }
  if (status === "error") {
    return (
      <section role="alert" className="errorPage">
        <div>
          <h1>Session verification failed</h1>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setError("");
              setStatus("checking");
              setRetryCount((count) => count + 1);
            }}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <Layout />
      <ChatBot />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <AuthenticatedApp />,
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
        path: "/assigned",
        element: <Assigned />,
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
        path: "/approved-observation-details/:id",
        element: <ApprovedObservationDetails />,
      },
      {
        path: "/rejected-observation-details",
        element: <RejecedObservationDetails />,
      },
      {
        path: "/pending-assigned-observation",
        element: <PendingAssignedObservation />,
      },
      {
        path: "/assigned-observation",
        element: <AssignedObservation />,
      },
      {
        path: "/assigned-observation-details",
        element: <AssignedObservationDetails />,
      },
      {
        path: "/assigned-observation-submission",
        element: <AssignedObservationSubmission />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/manage-userRole",
        element: <UsersRole />,
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
