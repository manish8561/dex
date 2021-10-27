import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { withRouter, useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";
import "./LandingPageStyle.scss";
import logo from "../../../assets/images/anchorswap-header-logo.svg";
import docsIcon from "../../../assets/images/socialicons/Docs.svg";
import githubIcon from "../../../assets/images/socialicons/github.svg";
import mediumIcon from "../../../assets/images/socialicons/Medium.svg";
import telegramIcon from "../../../assets/images/socialicons/Telegram.svg";
import twitterIcon from "../../../assets/images/socialicons/Twitter.svg";
import { HOME_ROUTE } from "../../../constant";
import { toast } from "../../../Components/Toast/Toast";
import { saveUserInfo, savereffralAddress } from "../../../redux/actions";

const LandingPage = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { ref } = useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    if (!name) {
      return toast.error("Please enter name");
    }
    if (!email) {
      return toast.error("Please enter email");
    }
    const res = await dispatch(saveUserInfo({ name, email }));
    if (res.status) {
      history.push("/home");
    }
  };
  const address = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";
  useEffect(() => {
    document.body.className = "landingPage";
    if (ref) {
      dispatch(savereffralAddress(ref));
    }
    return () => {
      document.body.className = "";
    };
  });

  return (
    <div className="container container-Landingpage">
      <div className="container lp_inside">
        <img alt="icon" src={logo} />
        <button className="home-btn" type="text">
          {" "}
          <Link to={`${HOME_ROUTE}home`}>Home</Link>
        </button>
        <p>
          The First Automatic Multichain Liquidity Acquisition Yield Farm & AMM.{" "}
          <br />
          Coming soon.
        </p>
        <div className="row">
          <div className="col">
            <input
              className="fcontrol"
              placeholder="Name"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="col">
            <input
              className="fcontrol"
              placeholder="Email"
              type=""
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <button
              className="btn keepmeUpdate_buttonStyle"
              type="text"
              onClick={handleSubmit}
            >
              Keep me updated
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <ul className="social_links">
              <li>
                <Link to="#">
                  <img alt="icon" src={docsIcon} />
                </Link>
              </li>
              <li>
                <Link to="#">
                  <img alt="icon" src={githubIcon} />
                </Link>
              </li>
              <li>
                <Link to="#">
                  <img alt="icon" src={mediumIcon} />
                </Link>
              </li>
              <li>
                <Link to="#">
                  <img alt="icon" src={telegramIcon} />
                </Link>
              </li>
              <li>
                <Link to="#">
                  <img alt="icon" src={twitterIcon} />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRouter(LandingPage);
