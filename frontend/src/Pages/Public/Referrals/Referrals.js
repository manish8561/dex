import React, { useEffect, useState } from "react";
import Button from "../../../Components/Button/Button";
import "./Referrals.scss";
import { useSelector } from "react-redux";
import { ReferralsServices } from "../../../services/ReferralsServices";
import { toast } from "../../../Components/Toast/Toast";
import { CopyToClipboard } from "react-copy-to-clipboard";
import copyIcon from "../../../assets/images/icon_copyAddress.png";

function Referrals() {
  const isUserConnected = useSelector((state) => state.persist.isUserConnected);
  useEffect(() => {
    init();
    return () => {};
  }, []);

  const [referralCount, setReferralCount] = useState("");
  const [referralIncome, setReferralIncome] = useState("");

  const init = async () => {
    const count = await ReferralsServices.getReferralCount(isUserConnected);
    const income = await ReferralsServices.getReferralCommissions(
      isUserConnected
    );
    setReferralCount(count);
    setReferralIncome(income);
  };

  return (
    <div className="container_wrap container_Oceans">
      <div className="container">
        <h2>AnchorSwap Referral Program</h2>
        <h5>
          Share the referral link below to invite your friends and earn 1% of
          your friends' earnings FOREVER!
        </h5>
        {isUserConnected ? (
          <div className="Unlockbox">
            <div className="UnlockboxTop">
              <div className="UnlockboxIn">
                <h3>Total Referrals</h3>
                <p>{referralCount}</p>
              </div>
              <div className="UnlockboxIn">
                <h3>Total Referral Commissions</h3>
                <p>{referralIncome} Anchor</p>
              </div>
            </div>
            <div className="UnlockboxIn">
              <h3>
                Your Referral Link{" "}
                {/* <Link to="#" className="copy">
                  Copy
                </Link> */}
              </h3>
              <CopyToClipboard
                text={`${window.location.origin}/home/${isUserConnected}`}
                onCopy={() => toast.success("Copied!")}
              >
                <a className="text-left" href="javascript:void(0);">
                  <a
                    href={`${window.location.origin}/home/${isUserConnected}`}
                    target="_blank"
                    rel="noreferrer"
                  >{`${window.location.origin}/home/${isUserConnected}`}</a>{" "}
                  <img className="copy-icon" src={copyIcon} alt="copy" />
                </a>
              </CopyToClipboard>
            </div>
          </div>
        ) : (
          <div className="lockbox">
            <Button
              type="button"
              className=""
              onClick={() => toast.error("Connect wallet first!")}
            >
              Unlock Wallet
            </Button>
            <p>Unlock wallet to get your unique referral link</p>
          </div>
        )}{" "}
      </div>
    </div>
  );
}

export default Referrals;
