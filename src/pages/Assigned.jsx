import { Link } from 'react-router-dom'
import { TitleBar } from '../components/UI/TitleBar'
import { MdRemoveRedEye } from 'react-icons/md'

export const Assigned = () => {
    return (
        <>
            <TitleBar title="Assigned Observation" />

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
                                <td>26</td>
                                <td>Pune</td>
                                <td>HIGH</td>
                                <td>--</td>
                                <td>19/10/2026 - 11:29 am</td>
                                <td><span className="pending">ASSIGNED_TO_OFFICER</span></td>
                                <td>
                                    <div className="items-center">
                                        <Link to='/assigned-observation-details' className="btn-view" title="View">
                                            <MdRemoveRedEye />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>26</td>
                                <td>Bengaluru</td>
                                <td>MEDIUM</td>
                                <td>--</td>
                                <td>16/10/2026 - 4:37 pm</td>
                                <td><span className="pending">ASSIGNED_TO_OFFICER</span></td>
                                <td>
                                    <div className="items-center">
                                        <Link to='' className="btn-view" title="View">
                                            <MdRemoveRedEye />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
