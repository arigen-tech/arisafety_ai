import { Link } from "react-router-dom";
import { TitleBar } from "../components/UI/TitleBar";
import { MdRemoveRedEye } from "react-icons/md";

const tableData = [
  {
    "id": "SAF-000124",
    "location": "Pune",
    "priority": "HIGH",
    "reportedBy": "Team Lead",
    "date": "06-10-26",
    "time": "12:15pm",     
    "status": "Pending",
    "url": "/observation-details",
  },
  {
    "id": "SAF-000125",
    "location": "Mumbai",
    "priority": "MEDIUM",
    "reportedBy": "Team Lead",
    "date": "05-10-26",
    "time": "06:20pm",     
    "status": "Pending",
    "url": "/observation-details",
  },
  {
    "id": "SAF-000126",
    "location": "Pune",
    "priority": "HIGH",
    "reportedBy": "Team Lead",
    "date": "04-10-26",
    "time": "10:12am",     
    "status": "Pending",
    "url": "/observation-details",
  },
  {
    "id": "SAF-000127",
    "location": "Mumbai",
    "priority": "LOW",
    "reportedBy": "Team Lead",
    "date": "03-10-26",
    "time": "09:50am",     
    "status": "Pending",
    "url": "/observation-details",    
  }
]

export const Pending = () => {
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
              {tableData.map((curElem) => { 
                const { id, location, priority, reportedBy, date, time, status, url } = curElem;
                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{location}</td>
                    <td>{priority}</td>
                    <td>{reportedBy}</td>
                    <td>{date} - {time}</td>
                    <td><span className="pending">{status}</span></td>
                    <td><div className="items-center"><Link to={url} className="btn- btn-view" title="View"><MdRemoveRedEye /></Link></div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
