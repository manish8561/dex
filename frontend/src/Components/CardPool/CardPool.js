import { useEffect, useState } from 'react'
import './CardPool.scss'
import { Link } from 'react-router-dom'
import Card from '../Card/Card'
import farmCoin from '../../assets/images/farm-coin-illu.png'
import Button from '../Button/Button'
import arrowDown from '../../assets/images/arrow-down.png'
import { BSC_SCAN, HOME_ROUTE } from '../../constant'
import { useDispatch, useSelector } from 'react-redux'
import { ContractServices } from '../../services/ContractServices'
import { MAIN_CONTRACT_LIST, WETH, ANCHOR_BUSD_LP, TOKEN_LIST, BNB_BUSD_LP } from '../../assets/tokens'
import { Fragment } from 'react'
import { toast } from '../Toast/Toast'
import { addTransaction, startLoading, stopLoading } from '../../redux/actions'
import { BigNumber } from "bignumber.js"
import { FarmService } from '../../services/FarmService'
import { ExchangeService } from '../../services/ExchangeService'
import { addCommas } from '../../constant'
import Col from 'react-bootstrap/Col'


const CardPool = (props) => {
  const dispatch = useDispatch();
  const isUserConnected = useSelector(state => state.persist.isUserConnected);
  const { farm: { poolInfo, userInfo, pid }, index, currentIndex, handleChange,
    harvestOnClick, stakeHandle, handleRoiModal, status } = props;
  const [lpTokenDetails, setLpTokenDetails] = useState(null);
  const [showIncrease, setShowIncrease] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0);
  const [tokenStaked, setTokenStaked] = useState(0);
  const [liquidity, setLiquidity] = useState(0);
  const [showApproveButton, setShowApproveButton] = useState(true);
  const [approvalConfirmation, setApprovalConfirmation] = useState(false);
  const [showHarvest, setShowHarvest] = useState(false);
  const [balance, setBalance] = useState(0);
  const [stakeAmounts, setStakeAmounts] = useState({ amount: 0, rewards: 0 });
  const [pantherAddress, setPantherAddress] = useState('');
  const [apr, setApr] = useState(0);
  const [roi, setROI] = useState({ allocPoint: 0, totalAllcationPoint: 0, anchorPerBlock: 0, anchorPrice: 0, liquidity: 0 });
  const [dollarValue, setAnchorDollarValue] = useState(0.01);
  const [stakedDollarValue, setStakedDollarValue] = useState(0);

  useEffect(() => {
    init();
    getPantherAddress();
    getAnchorDollarValue();
  }, [isUserConnected]);
  const getPantherAddress = async () => {
    const res = await FarmService.poolInfoo();
    setPantherAddress(res);
  }
  const getAnchorDollarValue = async () => {
    const reserves = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
    let val = reserves[1] / reserves[0];
    val = val || 0;
    setAnchorDollarValue(val.toFixed(3));
    return;

  }
  const init = async () => {
    if (poolInfo) {
      const { lpToken } = poolInfo;
      if (lpToken) {
        const totalSupplyTemp = await ContractServices.getTotalSupply(lpToken);
        setTotalSupply(totalSupplyTemp);
        const tokenAmount = await ExchangeService.getTokenStaked(lpToken);
        setTokenStaked(tokenAmount);
        let price = 0;
        if (lpToken.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
          price = 1
        } else {
          const tokenPairUSDT = await ExchangeService.getPair(lpToken, TOKEN_LIST[2].address);
          price = await calPrice(tokenPairUSDT);
        }

        const liq = (tokenAmount * price);
        setLiquidity(liq);
        const lpTokenDetailsTemp = await FarmService.getPoolTokenDetails(lpToken);
        const a = await calculateAPR(Number(poolInfo.allocPoint), lpToken);
        setApr(a);
        lpTokenDetailsTemp.apr = a;
        setLpTokenDetails(lpTokenDetailsTemp);
        if (isUserConnected) {
          const allowance = await ContractServices.allowanceToken(lpToken, MAIN_CONTRACT_LIST.farm.address, isUserConnected);
          let check = true;
          if (BigNumber(allowance).isGreaterThanOrEqualTo(BigNumber(2 * 255 - 1))) {
            setShowApproveButton(false);
            check = false;
          }

          let balance = await ContractServices.getTokenBalance(lpToken, isUserConnected);
          if (balance > 0.00001) {
            balance -= 0.00001;
          }
          setBalance(balance);

          const amount = Number((Number(userInfo.amount) / 10 ** Number(lpTokenDetailsTemp.decimals)).toFixed(5));
          const price = await handleStakeDollarValue(amount, lpToken);
          const rewards = Number((Number(await FarmService.pendingPanther(pid, isUserConnected) / 10 ** 18).toFixed(5)));

          if (!check && amount > 0) {
            setShowIncrease(true);
          }
          setStakeAmounts({ amount, rewards });

          setStakedDollarValue(price);


          //nextHarvest
          const nextHarvestUntil = await FarmService.canHarvest(pid, isUserConnected);
          if (!check && rewards > 0 && Number(userInfo.nextHarvestUntil) > 0 && nextHarvestUntil) {
            setShowHarvest(true);
          }
        }
      }
    }
  };

  const handleTokenApproval = async () => {
    const acc = await ContractServices.getDefaultAccount();
    if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
      return toast.error('Wallet address doesn`t match!');
    }
    if (approvalConfirmation) {
      return toast.info('Token approval is processing');
    }
    // (2*256 - 1);
    const value = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    try {
      dispatch(startLoading());
      setApprovalConfirmation(true);
      const r = await ContractServices.approveToken(isUserConnected, value, MAIN_CONTRACT_LIST.farm.address, poolInfo.lpToken);
      if (r) {
        let data = {
          message: `Approve LP Token`,
          tx: r.transactionHash
        };
        dispatch(addTransaction(data));
        setApprovalConfirmation(false);
        init();
      }
      dispatch(stopLoading());
    } catch (err) {
      setApprovalConfirmation(false);
      dispatch(stopLoading());
      toast.error('Approval Transaction Reverted!');
    }
  }

  const beforeStake = async (type) => {
    if (isUserConnected) {
      let bal = 0;
      if (type === 'deposit') {
        bal = balance;
      }
      if (type === 'withdraw') {
        bal = stakeAmounts.amount;
      }
      stakeHandle({ pid, poolInfo, lpTokenDetails, balance: bal }, type);
    } else {
      return toast.error('Connect wallet first!');
    }
  }

  const calPrice = async (pairAddress) => {

    let price = 0;

    if (pairAddress == "0x0000000000000000000000000000000000000000") {
      return 0;
    }

    const tokenZero = await ExchangeService.getTokenZero(pairAddress);
    const tokenOne = await ExchangeService.getTokenOne(pairAddress);
    const reserve = await ExchangeService.getReserves(pairAddress);

    const decimalZero = await ContractServices.getDecimals(tokenZero);
    const decimalOne = await ContractServices.getDecimals(tokenOne);

    if (tokenZero.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
      return price = ((reserve[0] * (10 ** decimalOne)) / (reserve[1] * (10 ** decimalZero)));
    }

    if (tokenOne.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
      return price = ((reserve[1] * (10 ** decimalZero)) / (reserve[0] * (10 ** decimalOne)));
    }

    let priceBNBToUSD = calPrice(BNB_BUSD_LP);
    if (tokenZero.toLowerCase() === WETH.toLowerCase()) {
      price = ((reserve[0] * (10 ** decimalOne)) / (reserve[1] * (10 ** decimalZero)));
      return (price * priceBNBToUSD);
    }

    if (tokenOne.toLowerCase() === WETH.toLowerCase()) {
      price = ((reserve[1] * (10 ** decimalZero)) / (reserve[0] * (10 ** decimalOne)));
      return (price * priceBNBToUSD);
    }
  }

  const calculateAPR = async (allocPoint, lpToken) => {

    const anchorPrice = await calPrice(ANCHOR_BUSD_LP);
    const totalAllcationPoint = Number(await FarmService.totalAllocationPoint());
    const anchorPerBlock = Number(await FarmService.pantherPerBlock());

    //need to calculate usd price.
    const liquidity = await handleLiquidity(lpToken);

    if (liquidity != 0) {
      const apr = ((allocPoint / totalAllcationPoint) * ((anchorPerBlock / 10 ** 18) * 28800 * 365 * 100 * anchorPrice)) / liquidity;

      setROI({ allocPoint, totalAllcationPoint, anchorPerBlock, anchorPrice, liquidity });

      return apr;
    }

    return 0;
  }
  const handleLiquidity = async (tokenAddress) => {

    if (tokenAddress != "0x0000000000000000000000000000000000000000") {

      const reserve = await ExchangeService.getTokenStaked(tokenAddress);
      const tokenPairUSDT = await ExchangeService.getPair(tokenAddress, TOKEN_LIST[2].address);
      const tokenPairBNB = await ExchangeService.getPair(tokenAddress, WETH);

      let priceA = 0;

      if (tokenAddress.toLowerCase() == TOKEN_LIST[2].address.toLowerCase()) {
        priceA = 1;
      } else if (tokenAddress.toLowerCase() == WETH.toLowerCase()) {
        priceA = await calPrice(BNB_BUSD_LP);
      }

      if (priceA == 0) {
        if (tokenPairUSDT != "0x0000000000000000000000000000000000000000") {
          priceA = await calPrice(tokenPairUSDT);
        } else if (tokenPairBNB != "0x0000000000000000000000000000000000000000") {
          priceA = await calPrice(tokenPairBNB);
          priceA = 0;
        }
      }

      const liquidity = (reserve * priceA);

      return Number(liquidity).toFixed(2);
    }
    return 0;
  }
  const handleIcon = (lpTokenName) => {
    if (lpTokenName != undefined) {
      const tokenObj = TOKEN_LIST.find(
        (d) => d.symbol.toLowerCase() === lpTokenName.toLowerCase()
      );
      return tokenObj.icon;
    }

  }
  const earnedDollarValue = (dollarValue, rewards) => {

    let fixedAfterDecimal = Number((dollarValue * rewards)).toFixed(3);
    let res = addCommas(fixedAfterDecimal);
    return res;
  }

  const handleStakeDollarValue = async (stakedAmount, lpToken) => {
    const pairAddress = await ExchangeService.getPair(lpToken, TOKEN_LIST[2].address);
    let price;
    if (lpToken.toLowerCase() === TOKEN_LIST[2].address) {
      price = 1;
    } else {
      price = await calPrice(pairAddress);
    }
    const dollarPrice = stakedAmount * price;
    return dollarPrice;
  }

  return (

    <Card className="farm_card pool-box box_col">
      <div className="row">
        <div className="col farm_card__farmCoin_style">
          <span className="farmCoin_style__coinLeft pool-coin">
            <img src={handleIcon(lpTokenDetails?.lpTokenName)} alt="" />
          </span>
        </div>
        <div className="col farmtop farm_card__coinInfo_right">
          <h2>{lpTokenDetails?.lpTokenName}</h2>
          <ul className="info_about_card">
            {poolInfo.depositFeeBP && Number(poolInfo.depositFeeBP) === 0 && <li className="info_about_card_feeinfo"> <img src={props.fee_icon} alt="" />  No Fee</li>}
            <li className="info_about_card_multi">{poolInfo?.allocPoint}X</li>
          </ul>
        </div>
      </div>
      <div className="col" >
        <ul className="farm_planInfo">
          {status &&
            <li>
              <strong>APR: </strong>
              <strong>
                <span className="token-icon" onClick={() => handleRoiModal(roi, lpTokenDetails)}>
                  <svg viewBox="0 0 25 24" color="text" width="20px" xmlns="http://www.w3.org/2000/svg" className="sc-bdfBwQ dhaIlc"><path d="M19.2 3H5.19995C4.09995 3 3.19995 3.9 3.19995 5V19C3.19995 20.1 4.09995 21 5.19995 21H19.2C20.3 21 21.2 20.1 21.2 19V5C21.2 3.9 20.3 3 19.2 3ZM19.2 19H5.19995V5H19.2V19Z" fill="#1FC7D4"></path><path d="M11.45 7.72021H6.44995V9.22022H11.45V7.72021Z" fill="#1FC7D4"></path><path d="M18.2 15.75H13.2V17.25H18.2V15.75Z" fill="#1FC7D4"></path><path d="M18.2 13.25H13.2V14.75H18.2V13.25Z" fill="#1FC7D4"></path><path d="M8.19995 18H9.69995V16H11.7V14.5H9.69995V12.5H8.19995V14.5H6.19995V16H8.19995V18Z" fill="#1FC7D4"></path><path d="M14.29 10.95L15.7 9.54L17.11 10.95L18.17 9.89L16.76 8.47L18.17 7.06L17.11 6L15.7 7.41L14.29 6L13.23 7.06L14.64 8.47L13.23 9.89L14.29 10.95Z" fill="#1FC7D4"></path></svg></span>
                {addCommas(apr.toFixed(2))}%</strong>
            </li>
          }
          <li>
            <strong>Earn: </strong>
            <strong>ANCHOR</strong>
          </li>
          <li>
            <strong>Deposit Fee: </strong>
            <strong>{poolInfo.depositFeeBP ? (Number(poolInfo.depositFeeBP) / 10000) * 100 : 0}%</strong>
          </li>
          <li>
            <strong>Harvest Lockup: </strong>
            <strong>{poolInfo.harvestInterval ? Number(((poolInfo.harvestInterval) / 3600).toFixed(2)) : 0} Hour(s)</strong>
          </li>
        </ul>
      </div>

      <div className="col cardFarm__earned">
        <h2>ANCHOR <strong>EARNED</strong></h2>

      </div>

      <div className="box-flex-col">
        <div className="col cardFarm__earned">
          {addCommas(stakeAmounts.rewards)}
          <p>${earnedDollarValue(dollarValue, stakeAmounts.rewards)}</p>
        </div>
        <div className="col cardFarm__buttonBlock">
          {/* {(poolInfo.lpToken.toLowerCase() === (pantherAddress && pantherAddress.toLowerCase())) &&
              <Button
                onClick={props.harvestOnClick}
                className="btn_cardFarm_style "
                disabled={props.harvest_isdisabled}
              >
                Compound
        </Button>} */}

          <Button
            onClick={() => {
              setShowHarvest(false);
              harvestOnClick(pid, lpTokenDetails?.lpTokenName);
            }}
            className="btn_cardFarm_style"
            disabled={!showHarvest}
          >
            Harvest
          </Button>
        </div>
      </div>
      <div className="col cardFarm__earned">
        <h2>{lpTokenDetails?.lpTokenName} <strong>STAKED</strong></h2>
      </div>
      <div className="col cardFarm__buttonBlock">
        <div className="staked">
          <div className="cardFarm__buttonBlock__value">
            {showIncrease ? <strong>{addCommas(stakeAmounts.amount)}</strong> : 0}
            <p>${stakedDollarValue ? addCommas(stakedDollarValue.toFixed(3)) : 0}</p>
          </div>
          <div className="col cardFarm__buttonBlock__increaseBtns">
            {isUserConnected ?
              <Fragment>
                {showIncrease ?
                  <ul className="cardFarm_increase">
                    <li><button type="button" onClick={() => beforeStake('withdraw')}>-</button></li>
                    <li><button type="button" onClick={() => beforeStake('deposit')}>+</button></li>
                  </ul>
                  :
                  <Fragment>
                    {showApproveButton ?
                      <Button type="button" className=""
                        onClick={() => handleTokenApproval()}
                      >
                        Approve Contract
                      </Button>
                      :
                      <Button type="button"
                        onClick={() => beforeStake('deposit')}
                        className="btn_cardFarm_style"
                      >
                        Stake
                      </Button>}
                  </Fragment>
                }
              </Fragment>
              :
              <Fragment>
                <Button type="button" className=""
                  onClick={() => toast.error('Connect to wallet first!')}
                >
                  Unlock Wallet
                </Button>
              </Fragment>
            }
          </div>
        </div>
      </div>
      <div className="col">
        <div className="col cardFarm_details">
          <Link to="#" onClick={handleChange}>
            {index === currentIndex ? 'Hide' : 'Details'}  <img src={arrowDown} alt="icon" />
          </Link>
        </div>
      </div>
      {index === currentIndex && (
        <div className="col cardFarm_details detailsbox">
          <ul>
            <li>Deposit: <Link to={`${HOME_ROUTE}liquidity`}><span>{lpTokenDetails?.lpTokenName}</span></Link></li>
            <li>Total Liquidity:<span>${addCommas(liquidity.toFixed(2))}</span></li>
            <li>Token:<span>{addCommas(Number(tokenStaked.toFixed(2)))}</span></li>
          </ul>
          <a className="view" href={`${BSC_SCAN}token/${poolInfo?.lpToken}`} target="_blank" rel="noreferrer">View on BscScan</a>
        </div>
      )}
    </Card>
  )

}


export default CardPool;
