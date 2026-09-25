import { Outlet, useNavigation } from "react-router-dom"
import { Footer } from "./Footer"
import { Header } from "./Header"
import { SideBarMenu } from "./SideBarMenu"
import { useState } from "react"

export const Layout = () => {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const navigation = useNavigation();

  const handleShowMenu = () => {
    document.body.classList.add("openModal");
    setShowSideMenu(true);
  }

  const handleCloseMenu = () => {
    document.body.classList.remove("openModal");
    setShowSideMenu(false);
  }

  //close menu onclick on siteBackdrop function here
  const closeAll = () => {
    var isSideBar = document.getElementsByClassName('sideBar');
    if (isSideBar.length > 0) {
      setShowSideMenu(false);
      document.querySelector('.sideBar').classList.remove("show");
    }
  }


  if (navigation.state === "loading") return <Loading />

  return (
    <>
      <div className="page-wrapper">
        {/* Sidebar menu here... */}
        <SideBarMenu handleCloseMenu={handleCloseMenu} showSideMenu={showSideMenu} />

        <div className="main-container">
          {/* Header component here... */}
          <Header onShowSideMenu={() => handleShowMenu()} />


          <main>
            <div className="innerFlex">
              {/* aap layout content here... */}
              <Outlet />
            </div>

            {/* footer component here... */}
            <Footer />

          </main>

        </div>
        {/* .main-container end here */}

      </div>


      {showSideMenu && <div className="siteBackdrop" onClick={closeAll}></div>}


    </>
  )
}
