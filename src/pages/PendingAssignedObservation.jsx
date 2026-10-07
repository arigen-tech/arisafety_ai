import { MdRemoveRedEye } from 'react-icons/md';
import { TitleBar } from '../components/UI/TitleBar';
import { Link } from 'react-router-dom';

export const PendingAssignedObservation = () => {
    return (
        <>
            <TitleBar title="Pending Assigned Observation" />

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
                            <tr>
                                <td>SAF-000124</td>
                                <td>Pune</td>
                                <td>HIGH</td>
                                <td>Team Lead</td>
                                <td>06-10-26 - 12:15pm</td>
                                <td><span className="pending">Pending</span></td>
                                <td><div className="items-center"><Link to="/assigned-observation" className="btn- btn-view" title="View"><MdRemoveRedEye /></Link></div></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
