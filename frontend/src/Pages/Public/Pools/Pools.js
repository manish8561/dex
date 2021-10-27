import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import "./Pools.scss";
import { Link } from "react-router-dom"
import Switch from "react-switch"
import CardPool from "../../../Components/CardPool/CardPool"
import checkCircle from "../../../assets/images/Icon awesome-check-circle.png"
import icon_coinAnchor from "../../../assets/images/icon_coinAnchor.png"
import icon_coinBnb from "../../../assets/images/icon_coinBnb.png"
import { FarmService } from "../../../services/FarmService"
import { addTransaction, startLoading, stopLoading } from '../../../redux/actions'
import { ContractServices } from "../../../services/ContractServices"
import Card from "../../../Components/Card/Card"
import Button from "../../../Components/Button/Button"
import closeBtn from '../../../assets/images/ionic-md-close.svg'
import { Fragment } from "react"
import { toast } from '../../../Components/Toast/Toast'
import BigNumber from "bignumber.js"
import TransactionModal from '../../../Components/TransactionModal/TransactionModal'
import { ReferralsServices } from "../../../services/ReferralsServices"
import RoiModal from "../../../Components/RoiModal/RoiModal"

const Pools = () => {
  const dispatch = useDispatch();
  const isUserConnected = useSelector(state => state.persist.isUserConnected);
  const referralAddress = useSelector(state => state.persist.referralAddress);

  const [checked, setChecked] = useState(false);
  const [active, setActive] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [showStake, setShowStake] = useState(false);
  const [showStakeWithdraw, setShowStakeWithdraw] = useState(false);
  const [showAPY, setShowAPY] = useState(false);
  const [roiModalData, setRoiModalData] = useState(null);

  const [poolLength, setPoolLength] = useState(0);
  const [farms, setFarms] = useState([]);
  const [inactiveFarms, setInactiveFarms] = useState([]);
  const [stakingOnly, setStakingOnly] = useState([]);
  const [stakeData, setStakeData] = useState(null);
  const [stakeValue, setStakeValue] = useState(0);
  const [referrer, setReferrer] = useState('0x0000000000000000000000000000000000000000');

  const [stakeConfirmation, setStakeConfimation] = useState(0);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [lpDetails, setLpTokenDetails] = useState(null);

  //staking only
  const handleChange = (nextChecked) => setChecked(nextChecked);

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setFarms([]);
    setInactiveFarms([]);
    setStakingOnly([]);
    init();
    window.location.reload();
  }

  const cloaseRoiModal = () => {
    setShowAPY(false);
  }
  const handleRoiModal = (data, lpDetails) => {
    setRoiModalData(data);
    setLpTokenDetails(lpDetails);
    setShowAPY(true);
  }

  const handleIndex = (index) => {
    if (currentIndex === index) {
      setCurrentIndex(-1);
    } else {
      setCurrentIndex(index);
    }
  };

  useEffect(() => {
    init();
    return () => {
      setFarms([]);
      setInactiveFarms([]);
    }
  }, [isUserConnected]);

  const init = async () => {
    try {
      dispatch(startLoading());
      let ref = await ReferralsServices.getReferrer(isUserConnected);
      if (ref === '0x0000000000000000000000000000000000000000') {
        if (referralAddress && referralAddress !== '0x0000000000000000000000000000000000000000') {
          ref = referralAddress;
        }
        setReferrer(ref);
      }
      const pL = Number(await FarmService.poolLength());
      setPoolLength(pL);
      // let farmsTemp = [];
      dispatch(stopLoading());
      for (let i = 0; i < pL; i++) {

        const poolInfo = await FarmService.poolInfo(i, '2');
        const userInfo = await FarmService.userInfo(i, isUserConnected);
        // console.log(userInfo, '------i------', i);
        if (poolInfo) {
          if (Number(poolInfo.allocPoint) === 0) {
            setInactiveFarms(inactiveFarms => [...inactiveFarms, { poolInfo, userInfo, pid: i }]);
          } else {
            if (Number(userInfo.amount) > 0) {
              setStakingOnly(stakingOnly => [...stakingOnly, { poolInfo, userInfo, pid: i }]);
            }
            setFarms(farms => [...farms, { poolInfo, userInfo, pid: i }]);
          }
        }
      }
    } catch (err) {
      console.log(err)
    }
  };
  const closeStakeModal = () => {
    setShowStakeWithdraw(false);
    setShowStake(false);
    setStakeData(null);
    setStakeValue(0);
  }

  const stakeHandle = (data, type) => {
    if (type === 'withdraw') {
      setStakeData(data);
      setShowStakeWithdraw(true);
    }
    if (type === 'deposit') {
      setStakeData(data);
      setShowStake(true);
    }
  }

  const handleStakeValue = e => {
    const value = e.target.value;
    setStakeValue(value);
  }
  const setMaxValue = () => setStakeValue(stakeData.balance);

  const harvest = async (pid, lpTokenName) => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error('Wallet address doesn`t match!');
    }

    if (stakeConfirmation) {
      return toast.info('Transaction is processing!');
    }
    setStakeConfimation(true);
    const data = {
      pid: pid.toString(),
      amount: 0,
      referrer: referrer,
      from: isUserConnected
    }
    try {
      dispatch(startLoading());
      const result = await FarmService.deposit(data);
      dispatch(stopLoading());
      setStakeConfimation(false);

      if (result) {
        setTxHash(result);
        setShowTransactionModal(true);

        const data = {
          message: `Harvest ${lpTokenName}`,
          tx: result
        };
        dispatch(addTransaction(data));
      }
    } catch (err) {
      console.log(err, 'lp harvest');
      dispatch(stopLoading());
      setStakeConfimation(false);

      const message = await ContractServices.web3ErrorHandle(err);
      toast.error(message);
    }
  }

  const depositWithdraw = async (type) => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error('Wallet address doesn`t match!');
    }
    const value = Number(stakeValue);
    if (isNaN(value)) {
      return toast.error('Enter vaild amount!');
    }
    if (value <= 0) {
      return toast.error('Enter amount greater than zero!');
    }
    if (value > stakeData.balance) {
      return toast.error('Value is greater than max value!');
    }
    if (!stakeData) {
      return toast.info('Reload page try again!');
    }
    if (stakeConfirmation) {
      return toast.info('Transaction is processing!');
    }
    setStakeConfimation(true);
    if (type === 'deposit') {
      const amount = BigNumber(value * 10 ** stakeData.lpTokenDetails.decimals).toFixed();
      // const deposit = '10000';

      const data = {
        pid: stakeData.pid.toString(),
        amount,
        referrer: referrer,
        from: isUserConnected
      }
      console.log(data, 'before deposit----------farm--------------');
      try {
        closeStakeModal();
        dispatch(startLoading());
        const result = await FarmService.deposit(data);
        dispatch(stopLoading());
        setStakeConfimation(false);

        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);

          const data = {
            message: `Deposit ${stakeData.lpTokenDetails.lpTokenName}`,
            tx: result
          };
          dispatch(addTransaction(data));
        }
      } catch (err) {
        console.log(err, 'lp deposit');
        dispatch(stopLoading());
        setStakeConfimation(false);

        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);
      }
    }
    if (type === 'withdraw') {
      const amount = BigNumber(value * 10 ** stakeData.lpTokenDetails.decimals).toFixed();

      const data = {
        pid: stakeData.pid.toString(),
        amount,
        from: isUserConnected
      }
      console.log(data, 'before withdraw----------farm--------------');
      try {
        closeStakeModal();
        dispatch(startLoading());
        const result = await FarmService.withdraw(data);
        dispatch(stopLoading());
        setStakeConfimation(false);

        if (result) {
          setTxHash(result);
          setShowTransactionModal(true);

          const data = {
            message: `Withdraw ${stakeData.lpTokenDetails.lpTokenName}`,
            tx: result
          };
          dispatch(addTransaction(data));
        }
      } catch (err) {
        console.log(err, 'lp withdraw');
        dispatch(stopLoading());
        setStakeConfimation(false);

        const message = await ContractServices.web3ErrorHandle(err);
        toast.error(message);

      }
    }
  }

  return (
    <div className="container_wrap pool-wrap">
      <div className="container form-wrapper-style">
        <div className="row">
          <div className="col farm_header_style">
            <div className="staked_btn_style">
              <Switch
                onChange={handleChange}
                checked={checked}
                className="react-switch"
                offColor="#496989"
                onColor="#E3D32D"
                offHandleColor="#000B29"
                onHandleColor="#000B29"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                height={39}
                width={83}
              />
              <p>Staked only</p>
            </div>
            <div>
              <ul className="activeInactive_buttonStyle">
                <li>
                  <Link to="#" className={active ? 'active' : ''} onClick={() => setActive(true)}>Active</Link>
                </li>
                <li>
                  <Link to="#" className={!active ? 'active' : ''} onClick={() => setActive(false)}>Inactive</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {active ?
          <Fragment>
            {checked ?
              <div className="row poolsBox">
                {stakingOnly.map((farm, index) =>
                  <CardPool
                    key={index}
                    index={index}
                    farm={farm}
                    coinLeft={icon_coinAnchor}
                    coinRight={icon_coinBnb}
                    fee_icon={checkCircle}
                    harvestOnClick={harvest}
                    currentIndex={currentIndex}
                    handleChange={() => handleIndex(index)}
                    stakeHandle={stakeHandle}
                    handleRoiModal={handleRoiModal}
                    status={true}
                  />
                )}
              </div> :
              <div className="row poolsBox">
                {farms.map((farm, index) =>
                  <CardPool
                    key={index}
                    index={index}
                    farm={farm}
                    coinLeft={icon_coinAnchor}
                    coinRight={icon_coinBnb}
                    fee_icon={checkCircle}
                    harvestOnClick={harvest}
                    currentIndex={currentIndex}
                    handleChange={() => handleIndex(index)}
                    stakeHandle={stakeHandle}
                    handleRoiModal={handleRoiModal}
                    status={true}

                  />
                )}
              </div>
            }
          </Fragment>
          :
          <div className="row poolsBox">
            {inactiveFarms.map((farm, index) =>
              <CardPool
                key={index}
                index={index}
                farm={farm}
                coinLeft={icon_coinAnchor}
                coinRight={icon_coinBnb}
                fee_icon={checkCircle}
                harvestOnClick={harvest}
                currentIndex={currentIndex}
                handleChange={() => handleIndex(index)}
                stakeHandle={stakeHandle}
                handleRoiModal={handleRoiModal}
                status={false}
                isPool={true}

              />
            )}
          </div>
        }
      </div>
      {showStake &&
        <Fragment>
          <div className="backdrop"></div>
          <Card className="selectCurrency_modal stakemodel">
            <div className="col modal_headerStyle">
              <div className="row modal_headerStyle__rowA lessMargin_bottom">
                <div className="  modal_headerStyle__rowA_colLeft">
                  <h2>Deposit {stakeData?.lpTokenDetails?.lpTokenName} Tokens</h2>
                </div>
                <div className="col modal_headerStyle__rowA_colRight">
                  <Link to="#" onClick={() => closeStakeModal()}><img src={closeBtn} alt="icon" /></Link>
                </div>
              </div>
            </div>
            <div className="stakemodel_box">
              <p>{stakeData?.balance} {stakeData?.lpTokenDetails?.lpTokenName} Available</p>
              <div className="stakemodelIn">
                <input
                  inputMode="decimal"
                  autoCorrect="off"
                  autoComplete="off"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  placeholder="0.0"
                  minLength={1}
                  maxLength={79}
                  spellCheck="off"
                  value={stakeValue}
                  type="text"
                  onChange={(e) => handleStakeValue(e)}
                />
                <span>{stakeData?.lpTokenDetails?.lpTokenName}
                  <Button type="button" className="btn buttonStyle" onClick={() => setMaxValue()}>Max</Button></span>
              </div>
              <div className="stakemodel_btn">
                <Button type="button" className="btn buttonStyle" onClick={() => closeStakeModal()} >Cancel</Button>
                <Button type="button" className="btn buttonStyle" disabled={stakeConfirmation} onClick={() => depositWithdraw('deposit')}>Confirm</Button>
              </div>
            </div>
          </Card>
        </Fragment>}

      {showStakeWithdraw &&
        <Fragment>
          <div className="backdrop"></div>
          <Card className="selectCurrency_modal stakemodel">
            <div className="col modal_headerStyle">
              <div className="row modal_headerStyle__rowA lessMargin_bottom">
                <div className="  modal_headerStyle__rowA_colLeft">
                  <h2>Witdhdraw {stakeData?.lpTokenDetails?.lpTokenName} Tokens</h2>
                </div>
                <div className="col modal_headerStyle__rowA_colRight">
                  <Link to="#" onClick={() => closeStakeModal()}><img src={closeBtn} alt="icon" /></Link>
                </div>
              </div>
            </div>
            <div className="stakemodel_box">
              <p>{stakeData?.balance} {stakeData?.lpTokenDetails?.lpTokenName} Available</p>
              <div className="stakemodelIn">
                <input inputMode="decimal"
                  autoCorrect="off"
                  autoComplete="off"
                  pattern="^[0-9]*[.,]?[0-9]*$"
                  placeholder="0.0"
                  minLength={1}
                  maxLength={79}
                  spellCheck="off"
                  value={stakeValue}
                  type="text"
                  onChange={(e) => handleStakeValue(e)}
                />
                <span>{stakeData?.lpTokenDetails?.lpTokenName}
                  <Button type="button" className="btn buttonStyle" onClick={() => setMaxValue()}>Max</Button></span>
              </div>
              <div className="stakemodel_btn">
                <Button type="button" className="btn buttonStyle" onClick={() => closeStakeModal()} >Cancel</Button>
                <Button type="button" className="btn buttonStyle" disabled={stakeConfirmation} onClick={() => depositWithdraw('withdraw')} >Confirm</Button>
              </div>
            </div>
          </Card>
        </Fragment>}
      {showTransactionModal && <TransactionModal closeTransactionModal={closeTransactionModal} txHash={txHash} />}
      {showAPY && <RoiModal roiModalData={roiModalData} lpDetails={lpDetails} handleClose={cloaseRoiModal} />}
    </div>
  );
};

export default Pools;
