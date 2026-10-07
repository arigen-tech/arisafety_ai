
import { Link } from "react-router-dom"
import { LoginForm } from "../components/LoginForm"

export const LoginPage = () => {

  return (
    <>
      <div className="login-page">

        {/* LEFT LOGIN PANEL */}
        <aside className="login-section">
          <div className="brand"><img src="images/tata-autocomp-logo.png" alt="Tata Autocomp logo" /></div>

          <div className="login-container">
            <p className="signin-text">Please sign in to your account</p>

            {/* Login form component     */}
            <LoginForm />

          </div>

          <footer>
            <p>Powered by <Link to="javascript:void(0)">Arigen Technology</Link></p>
          </footer>

        </aside>


        {/* RIGHT HERO SECTION */}
        <div className="hero-section"></div>

      </div>
    </>
  )
}
