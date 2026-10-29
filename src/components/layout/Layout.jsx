import { Link, Outlet, useNavigation } from "react-router-dom"
import { Footer } from "./Footer"
import { Header } from "./Header"
import { SideBarMenu } from "./SideBarMenu"
import { useState, useEffect } from "react"
import { Loading } from "./Loading"
import { usePageTranslation } from "../../hooks/usePageTranslation"

export const Layout = () => {
  const [showSideMenu, setShowSideMenu] = useState(false);
  const navigation = useNavigation();
  const { language, selectLanguage, isTranslating, translationError } = usePageTranslation();


  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(prev => !prev);
    }, 6000);

    return () => clearInterval(interval);
  }, []);



  const handleShowMenu = () => {
    document.body.classList.add("openModal");
    setShowSideMenu(true);
  }

  const handleCloseMenu = () => {
    document.body.classList.remove("openModal");
    setShowSideMenu(false);
  }

  //close menu onclick on siteBackdrop function here
  const showSiteBackdrop = () => {
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
          <Header
            onShowSideMenu={() => handleShowMenu()}
            language={language}
            onLanguageSelect={selectLanguage}
            isTranslating={isTranslating}
            translationError={translationError}
          />


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

      <div className="chatBot-wp">
        <Link to="javascritp:void(0)" class="open-button animated pulse infinite">
          <img src="images/chatbot-icon.svg" alt="chat bot icon" />
        </Link>
        <div className={`title-wp-chat animated1 bounce1 ${visible ? "" : "hidden"}`}>I'm here to help!</div>
      </div>

      {showSideMenu && <div className="siteBackdrop" onClick={showSiteBackdrop}></div>}


    </>
  )
}
