import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postPublicRequest } from "../service/apiService";
import { ENDPOINTS } from "../config/apiConfig";

export const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ usernameId: "", passwordId: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
                                        

        try {
            setLoading(true);

            // API ko "email" aur "password" keys chahiye
            const data = await postPublicRequest(ENDPOINTS.LOGIN, {
                email: formData.usernameId,
                password: formData.passwordId,
            });

            // apiService "token" key se read karti hai, isliye isi naam se save karo
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("expires_at", data.expires_at);
            localStorage.setItem(
                "user",
                JSON.stringify({
                    user_id: data.user_id,
                    username: data.username,
                    name: data.name,
                })
            );

            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleLogin}>
                <div className="mb-40">

                    <div className="loginForm user-icon">
                        <input
                            type="text"
                            id="usernameId"
                            name="usernameId"
                            placeholder="Username"
                            value={formData.usernameId}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="loginForm key-icon mb-25">
                        <div className="">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="passwordId"
                                name="passwordId"
                                placeholder="Password"
                                value={formData.passwordId}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className={showPassword ? "eye-disabled eye-enable" : "eye-disabled"}
                                onClick={() => setShowPassword(!showPassword)}
                            ></button>
                        </div>
                    </div>

                    {error && <span className="error-msg">{error}</span>}

                    <button type="submit" className="btn btn-primary mb-25 w-100" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <div className="text-center">
                        <p className="forgot-text mb-20">Forgot password? <Link to="javascript:void(0)">Tap here.</Link></p>
                        <p className="forgot-text">Don't have an account? <Link to="javascript:void(0)">Create Now</Link></p>
                    </div>
                </div>
            </form>
        </>
    )
}