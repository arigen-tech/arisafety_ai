import { NavLink, useNavigate } from "react-router-dom";

export const ErrorPage = () => {
    const navigate = useNavigate();
    return (
        <section className="errorPage">
            <div>
                <h1>Oops Error!</h1>
                <h2><span>404</span> <br /> Page not found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <div className="d-flex">
                    <button onClick={() => navigate(-1)} className="btn btn-outline">Go Back</button>
                    <NavLink to="/dashboard"><button className="btn btn-primary">Go to Dashboard</button></NavLink>
                </div>
            </div>
        </section>
    )
}


