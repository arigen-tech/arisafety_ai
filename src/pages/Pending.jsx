import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { MdRemoveRedEye } from "react-icons/md";
import { TitleBar } from "../components/UI/TitleBar";
import { getRequest } from "../service/apiService";
import { useTranslatedApiValues } from "../hooks/useTranslatedApiValues";

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
    departmentId: item.department_id ?? item.departmentId ?? item.department?.id ?? "",
    plantId: item.plant_id ?? item.plantId ?? item.plant?.id ?? "",
    observation: item,
  };
};

const formatStatus = (status) => String(status ?? "Pending").replace(/_/g, " ");
const getPendingDisplayValues = (row) => [
  String(row.location),
  String(row.priority),
  String(row.reportedBy),
  formatStatus(row.status),
];

export const Pending = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { translatedRows, translationError } = useTranslatedApiValues(rows, getPendingDisplayValues);

  useEffect(() => {
    let ignore = false;

    const loadPending = async () => {
      try {
        const res = await getRequest("/api/observations/pending"); // was getData

        // Works for [..] or { items | data | results: [..] }
        const list = Array.isArray(res)
          ? res
          : res?.items || res?.data || res?.results || [];

        if (!ignore) setRows(list.map(mapObservation));
      } catch (err) {
        if (ignore) return;
        console.error("Pending observations could not be loaded:", err);

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
          text: err.status === undefined
            ? "Unable to connect to the server. Please try again."
            : "Unable to load observations. Please try again.",
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
      {translationError && <p role="alert">{translationError}</p>}

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
                rows.map(({ id, dbId, location, priority, reportedBy, date, time, status, departmentId, plantId, observation }, index) => {
                  const [translatedLocation, translatedPriority, translatedReporter, translatedStatus] =
                    translatedRows[index] || getPendingDisplayValues({ location, priority, reportedBy, status });
                  return (
                  <tr key={dbId ?? id}>
                    <td data-translation-api="true">{id}</td>
                    <td data-translation-api="true">{translatedLocation}</td>
                    <td data-translation-api="true">{translatedPriority}</td>
                    <td data-translation-api="true">{translatedReporter}</td>
                    <td data-translation-api="true">{date} - {time}</td>
                    <td data-translation-api="true">{translatedStatus}</td>
                    <td>
                      <div className="items-center">
                        <Link
                          to={`/observation-details?id=${dbId ?? id}&department_id=${departmentId}&plant_id=${plantId}`}
                          className="btn- btn-view"
                          title="View"
                          state={{ observation }}
                        >
                          <MdRemoveRedEye />
                        </Link>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};