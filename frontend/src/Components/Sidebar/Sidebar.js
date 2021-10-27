import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ProSidebar,
  Menu,
  MenuItem,
  SubMenu,
  SidebarFooter,
} from "react-pro-sidebar";
import "./Sidebar.scss";
import { isMobile } from "react-device-detect";

import anchor_yellow_icon from "../../assets/images/socialicons/anchor-yellow-icon.svg";
import Icon_language from "../../assets/images/Icon_language.svg";
import docsIcon from "../../assets/images/socialicons/Docs.svg";
import githubIcon from "../../assets/images/socialicons/github.svg";
import telegramIcon from "../../assets/images/socialicons/Telegram.svg";
import twitterIcon from "../../assets/images/socialicons/Twitter.svg";
import { HOME_ROUTE, DOCS_LINK, TWITTER_LINK, TELEGRAM_LINK } from "../../constant";
import { ANTI_WHALE, AUTOMATIC_BURNING, AUTOMATIC_LIQUIDITY, BNB_LP, BUSD_LP, HARVEST_LOCKUP, LOTTERY, OVERVIEW_LINK, ROADMAP, TOKEN_LINK, ANCHOR_BUSD_LP } from "../../assets/tokens";
import { ExchangeService } from "../../services/ExchangeService"
import { useSelector } from "react-redux";
import { ContractServices } from "../../services/ContractServices";

const Sidebar = (props) => {
  const isUserConnected = useSelector((state) => state.persist.isUserConnected);
  const [selectedOption, setSelectedOption] = useState("");
  const [dollarValue, setAnchorDollarValue] = useState(0.01);
  const location = useLocation();
  const { pathname } = location;
  const splitLocation = pathname.split("/");
  const setSideBarOption = (option) => {
    if (selectedOption === option) {
      setSelectedOption("");
      if (isMobile) {
        props.closeSidebar();
      }
    } else {
      if (props.showSocial) {
        if (!isMobile) {
          props.closeSidebar();
        }
      }
      setSelectedOption(option);
    }
  };
  useEffect(async () => {
    if (props.showSocial) {
      setSelectedOption("");
    }
    const res = await ContractServices.isMetamaskInstalled('');

    if (isUserConnected && res) {
      getAnchorDollarValue();
    }
  }, [props.showSocial]);

  const getAnchorDollarValue = async () => {
    const reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
    let val = reserves[1] / reserves[0];
    val = val || 0;
    setAnchorDollarValue(val.toFixed(3));
    return;

  }
  const handleOnMobile = () => {
    if (isMobile) {
      props.closeSidebar();
      setSelectedOption("");
    }
  }
  return (
    <ProSidebar className={`sidebar_style ${props.className}`}>
      <Menu iconShape="square">
        <MenuItem
          onClick={() => setSideBarOption("")}
          className={splitLocation[1] === "home" ? "active" : ""}
          icon={<i className="home_nav_icon"></i>}
        >
          <Link to={`${HOME_ROUTE}home`}>Home</Link>
        </MenuItem>
        <SubMenu
          title="Trade"
          open={selectedOption === "Trade"}
          onOpenChange={() => setSideBarOption("Trade")}
          icon={<i className="trade_nav"></i>}
        >
          <MenuItem className={splitLocation[1] === "swap" ? "active" : ""}
            onClick={() => handleOnMobile()}>
            <Link to={`${HOME_ROUTE}swap`}>Exchange</Link>
          </MenuItem>
          <MenuItem
            className={splitLocation[1] === "liquidity" ? "active" : ""}
            onClick={() => handleOnMobile()}
          >
            <Link to={`${HOME_ROUTE}liquidity`}>Liquidity</Link>
          </MenuItem>
        </SubMenu>
        <MenuItem
          onClick={() => setSideBarOption("")}
          className={splitLocation[1] === "farm" ? "active" : ""}
          icon={<i className="farm_nav_icon"></i>}
        >
          <Link to="/farm">Farms</Link>
        </MenuItem>
        <MenuItem
          onClick={() => setSideBarOption("")}
          icon={<i className="pools_nav_icon"></i>}
        >
          <Link to={`${HOME_ROUTE}pools`}>Pools</Link>
        </MenuItem>
        <MenuItem
          onClick={() => setSideBarOption("")}
          icon={<i className="ocean_nav_icon"></i>}
        >
          <Link to={`${HOME_ROUTE}oceans`}>Ocean</Link>
        </MenuItem>
        <MenuItem
          onClick={() => setSideBarOption("")}
          icon={<i className="lottery_nav_icon"></i>}
        >
          <Link to={`${HOME_ROUTE}lottery`}>Lottery</Link>
        </MenuItem>
        <MenuItem
          onClick={() => setSideBarOption("")}
          icon={<i className="referrals_nav_icon"></i>}
        >
          <Link to={`${HOME_ROUTE}referrals`}>Referrals</Link>
        </MenuItem>
        <MenuItem
          onClick={() => setSideBarOption("")}
          icon={<i className="audits_nav_icon"></i>}
        >
          <Link to={`${HOME_ROUTE}home`}>Audits</Link>
        </MenuItem>
        <SubMenu
          title="Features"
          open={selectedOption === "Features"}
          onOpenChange={() => setSideBarOption("Features")}
          icon={<i className="features_nav_icon"></i>}
        >
          {/* <MenuItem>
            <Link to={HOME_ROUTE}>Listing</Link>
          </MenuItem> */}
          <MenuItem>
            <a href={AUTOMATIC_BURNING} target="_black">Automatic Burning</a>
          </MenuItem>
          <MenuItem>
            <a href={HARVEST_LOCKUP} target="_black">Harvest Lockup</a>
          </MenuItem>
          <MenuItem>
            <a href={ANTI_WHALE} target="_black">Anti-Whale</a>
          </MenuItem>
          <MenuItem>
            <a href={AUTOMATIC_LIQUIDITY} target="_black">Automatic Liquidity</a>
          </MenuItem>
          <MenuItem>
            <a href={LOTTERY} target="_black">Lottery</a>
          </MenuItem>
          <MenuItem>
            <a href={ROADMAP} target="_black">Roadmap</a>
          </MenuItem>
        </SubMenu>



        <SubMenu
          title="Analytics"
          open={selectedOption === "Analytics"}
          onOpenChange={() => setSideBarOption("Analytics")}
          icon={<i className="analytics_nav_icon"></i>}
        >
          <MenuItem>
            <a href={OVERVIEW_LINK} target="_blank">Overview</a>
          </MenuItem>
          <MenuItem>
            <a href={TOKEN_LINK} target="_blank">Token</a>
          </MenuItem>
          <MenuItem>
            <a href={BUSD_LP} target="_blank">Pair(BUSD LP)</a>
          </MenuItem>
          <MenuItem>
            <a href={BNB_LP} target="_blank">Pair(BNB LP)</a>
          </MenuItem>
          {/* <MenuItem>
            <Link to={HOME_ROUTE}>Accounts</Link>
          </MenuItem> */}
        </SubMenu>
      </Menu>

      <SidebarFooter className="sidebar_footer_style">
        <ul className="token-language">
          <li className="token_list">
            <Link to="#">
              <img alt="icon" src={anchor_yellow_icon} /> <span>${dollarValue}</span>
            </Link>
          </li>
          <li className="lang_list">
            <MenuItem>
              <img alt="icon" src={Icon_language} />  
              <span className="lang_text">EN</span>
            </MenuItem>
          </li>
        </ul>
        <ul className="social_links">
          <li>
            <a href={DOCS_LINK} target="_blank">
              <img alt="icon" src={docsIcon} />
            </a>
          </li>
          <li>
            <Link to="#">
              <img alt="icon" src={githubIcon} />
            </Link>
          </li>
          {/* <li>
              <Link to="#">
                <img alt="icon" src={mediumIcon} />
              </Link>
            </li> */}
          <li>
            <a href={TELEGRAM_LINK} target="_blank">
              <img alt="icon" src={telegramIcon} />
            </a>
          </li>
          <li>
            <a href={TWITTER_LINK} target="_blank">
              <img alt="icon" src={twitterIcon} />
            </a>
          </li>
        </ul>
      </SidebarFooter>

    </ProSidebar >
  );
};

export default Sidebar;
