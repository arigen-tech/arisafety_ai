import { TitleBar } from "../components/UI/TitleBar"

const tableData = [
  {
    "id": "SAF-000124",
    "location": "Pune",
    "area": "Electrical Maintenance",
    "type": "Unsafe Condition",
    "reportedBy": "Team Lead",
    "aifinding": "Potential Electrical Hazard",
    "priority": "HIGH",
  },
  {
    "id": "SAF-000125",
    "location": "Mumbai",
    "area": "Electrical Maintenance",
    "type": "Unsafe Condition",
    "reportedBy": "Team Lead",
    "aifinding": "Potential Electrical Hazard",
    "priority": "MEDIUM",
  },
  {
    "id": "SAF-000126",
    "location": "Pune",
    "area": "Electrical Maintenance",
    "type": "Unsafe Condition",
    "reportedBy": "Team Lead",
    "aifinding": "Potential Electrical Hazard",
    "priority": "HIGH",
  },
  {
    "id": "SAF-000127",
    "location": "Mumbai",
    "area": "Electrical Maintenance",
    "type": "Unsafe Condition",
    "reportedBy": "Team Lead",
    "aifinding": "Potential Electrical Hazard",
    "priority": "LOW",
  }
]

export const ObservationManagement = () => {
  return (
    <>
      <TitleBar title="Observation Details" />

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Observation ID</th>
                <th>Plant</th>
                <th>Area</th>
                <th>Type</th>
                <th>Reported By</th>
                <th>AI Finding</th>
                <th>Risk</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((curElem) => {
                const { id, location, area, type, reportedBy, aifinding, priority } = curElem;
                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{location}</td>
                    <td>{area}</td>
                    <td>{type}</td>
                    <td>{reportedBy}</td>
                    <td>{aifinding}</td>
                    <td>{priority}</td>
                    <td><div className="items-center"><button type="button" className="btn btn-view" title="View"><img src="images/icons/view-icon.svg" alt="voew icon" /></button></div></td>
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
