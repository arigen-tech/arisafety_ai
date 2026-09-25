import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <form id="">
                <div className="mb-40">

                    <div className="loginForm user-icon">
                        {/* <label for="usernameId">Username</label> */}
                        <input type="text" id="usernameId" name="usernameId" placeholder="Username" required />
                        {/* <span className="error-msg">Error message...</span> */}
                    </div>

                    <div className="loginForm key-icon mb-25">
                        {/* <label for="passwordId">Password</label> */}
                        <div className="">
                            <input type={showPassword ? "text" : "password"} id="passwordId" name="passwordId" placeholder="Password" required />
                            <button type="button" className={showPassword ? "eye-disabled eye-enable" : "eye-disabled"} onClick={() => setShowPassword(!showPassword)}></button>
                        </div>
                        {/* <span className="error-msg">Error message...</span> */}
                    </div>

                    {/* <Link to="/dashboard">Login</Link> */}
                    <button type="button" onClick={() => navigate("/dashboard")} className="btn btn-primary mb-25 w-100">Login</button>

                    <div className="text-center">
                        <p className="forgot-text mb-20">Forgot password? <Link to="javascript:void(0)">Tap here.</Link></p>
                        <p className="forgot-text">Don't have an account? <Link to="javascript:void(0)">Create Now</Link></p>
                    </div>
                </div>
            </form>
        </>
    )
}
