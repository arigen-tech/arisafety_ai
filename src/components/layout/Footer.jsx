import { Link } from "react-router-dom";

export const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer>
      <p>&copy; {year} All rights reserved.</p>
      <p>Powered by <Link to="javascript:void(0)">Arigen Technology</Link></p>
    </footer>
  )
}
