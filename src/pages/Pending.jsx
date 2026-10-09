import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { MdRemoveRedEye } from "react-icons/md";
import { TitleBar } from "../components/UI/TitleBar";
import { getRequest } from "../service/apiService";

// Converts one backend record into the shape the table uses.
const mapObservation = (item) => {
  const created = item.created_at || item.reported_at || item.date || item.created_date;
  const d = created ? new Date(created) : null;
  const validDate = d && !isNaN(d);

  return {
    id: item.observation_id ?? item.code ?? item.id,
    dbId: item.id,
    location: item.plant ?? item.plant_name ?? item.location ?? "-",
    priority: String(item.risk ?? item.risk_level ?? item.priority ?? "-").toUpperCase(),
    reportedBy: item.reported_by ?? item.reported_by_name ?? item.created_by ?? "-",
    date: validDate ? d.toLocaleDateString("en-GB") : "-",
    time: validDate
      ? d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase()
      : "",
    status: item.status ?? "Pending",
  };
};

export const Pending = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadPending = async () => {
      try {
        const res = await getRequest("/api/observations/pending"); // was getData
        console.log("pending response:", res); // remove after the mapping is correct

        // Works for [..] or { items | data | results: [..] }
        const list = Array.isArray(res)
          ? res
          : res?.items || res?.data || res?.results || [];

        if (!ignore) setRows(list.map(mapObservation));
      } catch (err) {
        if (ignore) return;

        // Token missing or expired
        if (err.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        Swal.fire({
          icon: "error",
          title: "Could not load observations",
          text: err.status === undefined ? "Unable to connect to the server" : err.message,
        });
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadPending();
    return () => { ignore = true; };
  }, [navigate]);

  return (
    <>
      <TitleBar title="Pending Observation" />

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Observation ID</th>
                <th>Plant</th>
                <th>Risk</th>
                <th>Reported By</th>
                <th>Reported Date & Time</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="7" className="text-center">No pending observations</td></tr>
              ) : (
                rows.map(({ id, dbId, location, priority, reportedBy, date, time, status }) => (
                  <tr key={dbId ?? id}>
                    <td>{id}</td>
                    <td>{location}</td>
                    <td>{priority}</td>
                    <td>{reportedBy}</td>
                    <td>{date} - {time}</td>
                    <td>{status}</td>
                    <td>
                      <div className="items-center">
                        <Link
                          to={`/observation-details?id=${dbId ?? id}`}
                          className="btn- btn-view"
                          title="View"
                        >
                          <MdRemoveRedEye />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};