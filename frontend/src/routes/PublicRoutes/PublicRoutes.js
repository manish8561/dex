import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router-dom";
import { withRouter } from "react-router";
import Header from "../../Components/Header/Header";
import Sidebar from "../../Components/Sidebar/Sidebar";
import Home from "../../Pages/Public/Home/Home";
import Swap from "../../Pages/Public/Swap/Swap";
import Liquidity from "../../Pages/Public/Liquidity/Liquidity";
import Farm from "../../Pages/Public/Farm";
import Oceans from "../../Pages/Public/Oceans/Oceans";
import Lottery from "../../Pages/Public/Lottery/Lottery";
import { HOME_ROUTE } from "../../constant";
import Pools from "../../Pages/Public/Pools/Pools";
import Referrals from "../../Pages/Public/Referrals/Referrals";

const PublicRoutes = () => {
  const [small, setSmall] = useState(false);
  const [navCollapse, setNavCollapse] = useState(false);
  const [tradeDropdown, openCloseTradeDropdown] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", () =>
        setSmall(window.pageYOffset > 200)
      );
    }
  }, []);

  const handleNavCollapse = () => {
    setNavCollapse((prevNavCollapse) => !prevNavCollapse);
    if (navCollapse === false) {
      document.body.className = "expande_container";
      // return () => { document.body.className = ''; }
    } else {
      document.body.className = "";
    }
  };

  const handleSubNav = () => {
    setNavCollapse((prevNavCollapse) => prevNavCollapse);
  };

  return (
    <>
      <Header
        className={`fixed ${small ? "isFixed" : ""}`}
        small_nav={() => handleNavCollapse()}
        mobileIcon={navCollapse}
      />
      <Sidebar
        className={`fixed ${small ? "isFixed" : ""} ${
          navCollapse ? "small_nav" : ""
        }`}
        showSocial={navCollapse}
        onClickOpenSidebar={() => handleSubNav()}
        closeSidebar={() => {
          handleNavCollapse();
        }}
        tradeDropdown={() => {
          if (navCollapse === true) {
            alert("collapsed");
            handleNavCollapse();
          }
        }}
        // tradeDropdown={!tradeDropdown}
        onOpenChange={(open) => {
          alert("fd");
          openCloseTradeDropdown(!open);
        }}
      />
      <Switch>
        <Route path={HOME_ROUTE} component={Home} exact={true} />
        <Route path={`${HOME_ROUTE}home/:ref`} component={Home} exact={true} />
        <Route path={`${HOME_ROUTE}home`} component={Home} exact={true} />
        <Route path={`${HOME_ROUTE}swap`} component={Swap} exact={true} />
        <Route
          path={`${HOME_ROUTE}liquidity`}
          component={Liquidity}
          exact={true}
        />
        <Route
          path={`${HOME_ROUTE}referrals`}
          component={Referrals}
          exact={true}
        />

        <Route path={`${HOME_ROUTE}farm`} component={Farm} exact={true} />
        <Route path={`${HOME_ROUTE}oceans`} component={Oceans} exact={true} />
        <Route path={`${HOME_ROUTE}lottery`} component={Lottery} exact={true} />
        <Route path={`${HOME_ROUTE}pools`} component={Pools} exact={true} />
      </Switch>
    </>
  );
};

export default withRouter(PublicRoutes);
