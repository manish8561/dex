import { useState } from "react";
import './Home.scss'
import { Link } from 'react-router-dom'
import CardHome from '../../../Components/CardHome/CardHome'
import anchorswapLogoButton from '../../../assets/images/anchorswap-logo-button@2x.png'
import addMetamask from '../../../assets/images/addMetamask@2x.png'
import anchorswapLogo from '../../../assets/images/anchorswap-header-logo.svg';
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { ContractServices } from "../../../services/ContractServices";
import { LotteryServices } from "../../../services/LotteryServices";
import { FarmService } from "../../../services/FarmService";
import { ExchangeService } from "../../../services/ExchangeService"
import { useSelector } from "react-redux";
import { toast } from "../../../Components/Toast/Toast";
import { MAIN_CONTRACT_LIST, BURN_ADDRESS, ANCHOR_BUSD_LP, WETH, TOKEN_LIST, BNB_BUSD_LP } from "../../../assets/tokens";
import WalletList from "../../../Components/Header/WalletList"
import Button from '../../../Components/Button/Button'
import { addTransaction, startLoading, stopLoading } from '../../../redux/actions'
import { ReferralsServices } from "../../../services/ReferralsServices"
// import { isMetamakConnected } from "../../../constant";
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import { BigNumber } from "bignumber.js"
import Loader from 'react-loader-spinner'
import { addCommas } from "../../../constant";

const Home = () => {
    const dispatch = useDispatch();
    const isUserConnected = useSelector((state) => state.persist.isUserConnected);
    const [potDetails, setPotDetails] = useState({
        prizeArray: [0, 0, 0],
        miniPrice: 0,
        pot: 0,
        decimals: 0,
    });
    const referralAddress = useSelector(state => state.persist.referralAddress);
    const [rewards, seRewards] = useState(0);
    const [anchorPerBlock, setAnchorPerBlock] = useState(0);
    const [transferTaxRate, setTransferTaxRate] = useState(0);
    const [burnedToken, setBurnedToken] = useState(0);
    const [walletShow, setWalletShow] = useState(false);
    const [poolLength, setPoolLength] = useState(0);
    const [farms, setFarms] = useState([]);
    const [inactiveFarms, setInactiveFarms] = useState([]);
    const [stakingOnly, setStakingOnly] = useState([]);
    const [stakeData, setStakeData] = useState(null);
    const [stakeValue, setStakeValue] = useState(0);
    const [referrer, setReferrer] = useState('0x0000000000000000000000000000000000000000');
    const [totalAmount, setAmount] = useState(0);
    const [totalRewards, setRewards] = useState(0);
    const [marketCap, setMarketCap] = useState(0.00);
    const [anchorTotalSupply, setAnchorTotalSupply] = useState(0);
    const [anchorBusdValue, setAnchorBusdValue] = useState(0);
    const [totalMinted, setTotalMinted] = useState(0);
    const [totalLockedRewards, setTotalLockedRewards] = useState(0);
    const [anchorBnbWorth, setAnchorBnbWorth] = useState(0);
    const [anchorBusdWorth, setAnchorBusdWorth] = useState(0);
    const [tokenIds, setTokenIds] = useState();
    const [allowance, setAllowance] = useState(false);
    const [disable, setDisabledBUtton] = useState(false);
    const [IButton, setIButton] = useState(false);
    const [ticketWindow, openTicketWindow] = useState(false);
    const [ticketValue, setvalue] = useState(1);
    const [buyButton, setBuyButton] = useState(false);
    const [loader, setLoader] = useState(false);
    const [currentTicketsArray, setCurrentArray] = useState([]);
    const [showHarvest, setShowHarvest] = useState(false);
    const [harvest, setHarvestAll] = useState([]);
    const [stakeConfirmation, setStakeConfimation] = useState(0);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [txHash, setTxHash] = useState('');
    const [farmAndStakeLoader, setFarmAndStakeLoader] = useState(false);
    const [liquidity, setLiquidity] = useState(0);

    useEffect(() => {
        init();
    }, [isUserConnected]);

    const init = async () => {
        const res = await ContractServices.isMetamaskInstalled();

        if (isUserConnected && res) {
            totalPotSize();
            getLotteryData();
            getAnchorPerBlock();
            getTransferTaxRate();
            getBurnedToken();
            getAnchorDollarValue();
            getMarketCap();
            handleLiquidity(TOKEN_LIST[1].address, WETH);
            handleLiquidityForAnchorBusd(TOKEN_LIST[1].address, TOKEN_LIST[2].address);
            getAllowance();

            try {
                dispatch(startLoading());
                let ref = await ReferralsServices.getReferrer(isUserConnected);
                if (ref === '0x0000000000000000000000000000000000000000') {
                    if (referralAddress && referralAddress !== '0x0000000000000000000000000000000000000000') {
                        ref = referralAddress;
                    }
                    setReferrer(ref);
                }
                dispatch(stopLoading());
                const pL = Number(await FarmService.poolLength());
                setPoolLength(pL);
                // let farmsTemp = [];
                let totalRewards = 0;
                let totalLockedRewards = 0;
                let totalLiquidity = 0;
                let options = [];
                const res = await ContractServices.getTokenBalance(TOKEN_LIST[1].address, isUserConnected);
                setAmount(res);
                // setFarmAndStakeLoader(true);
                for (let i = 0; i < pL; i++) {
                    const res = await FarmService.totalPoolInfo(i);
                    const userInfo = await FarmService.userInfo(i, isUserConnected);
                    const { poolInfo, latest } = res;

                    if (poolInfo.lpToken != undefined) {
                        const allowance = await ContractServices.allowanceToken(poolInfo.lpToken, MAIN_CONTRACT_LIST.farm.address, isUserConnected);
                        let check = true;
                        if (BigNumber(allowance).isGreaterThanOrEqualTo(BigNumber(2 * 255 - 1))) {
                            // setShowApproveButton(false);
                            check = false;
                        }
                        const reserve = await ExchangeService.getReserves(ANCHOR_BUSD_LP);
                        const tokenZero = await ExchangeService.getTokenZero(ANCHOR_BUSD_LP);
                        const tokenOne = await ExchangeService.getTokenOne(ANCHOR_BUSD_LP);
                        const anchorPerBlock = Number(await FarmService.pantherPerBlock());

                        const price = await getPriceInUsd(tokenZero, tokenOne, reserve);

                        totalLockedRewards += (latest - poolInfo.lastRewardBlock) * price * (anchorPerBlock / 10 ** 18);
                        setTotalLockedRewards(totalLockedRewards);
                        const farmPoolInfo = await FarmService.farmAndPoolInfo(i);
                        const { farm, pool } = farmPoolInfo;
                        if (farm) {
                            let res = await handleTotalLiquidity(farm.lpToken);
                            totalLiquidity += Number(res);
                        }
                        if (pool) {
                            const tokenAmount = await ExchangeService.getTokenStaked(pool.lpToken);
                            let price = 0;
                            if (pool.lpToken.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
                                price = 1
                            } else {
                                const tokenPairUSDT = await ExchangeService.getPair(pool.lpToken, TOKEN_LIST[2].address);
                                price = await calPrice(tokenPairUSDT);
                            }

                            const liq = (tokenAmount * price);
                            totalLiquidity += Number(liq);
                            setLiquidity(totalLiquidity);
                        }
                        const rewards = Number((Number(await FarmService.pendingPanther(i, isUserConnected) / 10 ** 18).toFixed(3)));
                        totalRewards += rewards;
                        setRewards(totalRewards);

                        const nextHarvestUntil = await FarmService.canHarvest(i, isUserConnected);
                        if (!check && rewards > 0 && Number(userInfo.nextHarvestUntil) > 0 && nextHarvestUntil) {
                            setShowHarvest(true);
                            options.push({ pid: i, lpToken: poolInfo.lpToken });
                        }
                    }
                    // if (i + 1 == pL) {
                    //     setFarmAndStakeLoader(false);
                    // }
                }
                setHarvestAll(options);
            } catch (err) {
                console.log(err)
                setFarmAndStakeLoader(false);
            }
        }
    };
    const getPriceInUsd = async (tokenZero, tokenOne, reserve) => {

        let price;

        const decimalZero = await ContractServices.getDecimals(tokenZero);
        const decimalOne = await ContractServices.getDecimals(tokenOne);

        if (tokenZero.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
            price = (reserve[0] * decimalOne) / (reserve[1] * decimalZero);
        }

        if (tokenOne.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
            price = (reserve[1] * decimalZero) / (reserve[0] * decimalOne);
        }

        return price;
    }
    const totalPotSize = async () => {
        const address = await ContractServices.isMetamaskInstalled('');
        if (address) {
            try {
                const { amount, decimals, prizeArray, price } =
                    await LotteryServices.getTotalPotSize();

                setPotDetails({
                    ...potDetails,
                    pot: amount,
                    miniPrice: price,
                    decimals,
                    prizeArray,
                });

            } catch (error) {
                console.log(error);
            }
        }
    };
    const getLotteryData = async () => {
        try {
            const contract = await ContractServices.callContract(
                MAIN_CONTRACT_LIST.lottary.address,
                MAIN_CONTRACT_LIST.lottary.abi
            );

            const issueIndex = await contract.methods.issueIndex().call();
            const index = issueIndex - 1 < 0 ? 0 : issueIndex - 1;
            getRewards(index);
        } catch (error) {
            console.log(error);
        }
    };
    const getAnchorPerBlock = async () => {
        try {
            const anchorPerBlock = Number(await FarmService.pantherPerBlock());
            setAnchorPerBlock(anchorPerBlock / 10 ** 18);
        } catch (error) {
            console.log(error);
        }
    };
    const getRewards = async (index) => {
        try {
            const response = await LotteryServices.getRewards(isUserConnected, index);
            seRewards(response.totalRewards);
            setTokenIds(response.tokenIds);
        } catch (error) {
            console.log(error);
        }
    };
    const getTransferTaxRate = async () => {
        try {
            const response = await LotteryServices.getTransferTaxRate();
            setTransferTaxRate(response);
        } catch (error) {
            console.log(error);
        }
    }
    const getBurnedToken = async () => {
        try {
            const response = await ExchangeService.getBurnedToken();
            setBurnedToken(response);
        } catch (error) {
            console.log(error);
        }
    }

    const getMarketCap = async () => {
        const dollarValue = await getAnchorDollarValue();
        const totalSupply = await getTotalSupply();
        setMarketCap((dollarValue * totalSupply));
    }

    const getAnchorDollarValue = async () => {
        const reserves = await ExchangeService.getReserves("0xC0Ff9f250d2D97F90BC89bD16D3B5344CdC68d06");
        setAnchorBusdValue(reserves[1] / reserves[0]);
        return reserves[1] / reserves[0];

    }
    const getTotalSupply = async () => {
        const res = await ExchangeService.getTotalSupply(MAIN_CONTRACT_LIST.anchor.address);
        const anchorTotalSupply = res;
        const txAmount = (0.05 * anchorTotalSupply) / 100;
        setTotalMinted(anchorTotalSupply);
        setAnchorTotalSupply(txAmount);
        return res;

    }
    const getTicketCurrentIndex = async () => {
        setLoader(true);
        const response = await LotteryServices.getCurrentTickets(isUserConnected);
        setCurrentArray(response);
        setLoader(false);
    };
    const handleLiquidityForAnchorBusd = async (token0, token1) => {
        const pairAddress = await ExchangeService.getPair(token0, token1);
        const reserve = await ExchangeService.getReserves(pairAddress);
        const tokenZero = await ExchangeService.getTokenZero(pairAddress);
        const tokenOne = await ExchangeService.getTokenOne(pairAddress);

        const decimalZero = await ContractServices.getDecimals(tokenZero);
        const decimalOne = await ContractServices.getDecimals(tokenOne);
        const decimalPair = await ContractServices.getDecimals(pairAddress);

        const priceOfTokenZero = await getPriceByTokens(tokenZero);
        const priceOfTokenOne = await getPriceByTokens(tokenOne);
        const totalSupply = await ExchangeService.getTotalSupply(pairAddress);

        const liquidity = (((reserve[0] / (10 ** decimalZero)) * priceOfTokenZero) + ((reserve[1] / (10 ** decimalOne)) * priceOfTokenOne)) / (totalSupply);

        setAnchorBusdWorth(liquidity);
        return;

    }

    const handleLiquidity = async (token0, token1) => {
        const pairAddress = await ExchangeService.getPair(token0, token1);
        const reserve = await ExchangeService.getReserves(pairAddress);
        const tokenZero = await ExchangeService.getTokenZero(pairAddress);
        const tokenOne = await ExchangeService.getTokenOne(pairAddress);

        const decimalZero = await ContractServices.getDecimals(tokenZero);
        const decimalOne = await ContractServices.getDecimals(tokenOne);


        const priceOfTokenZero = await getPriceByTokens(tokenZero);
        const priceOfTokenOne = await getPriceByTokens(tokenOne);
        const totalSupply = await ExchangeService.getTotalSupply(pairAddress);

        const liquidity = (((reserve[0] / (10 ** decimalZero)) * priceOfTokenZero) + ((reserve[1] / (10 ** decimalOne)) * priceOfTokenOne)) / totalSupply;

        setAnchorBnbWorth(liquidity);
        return;

    }
    const getPriceByTokens = async (token) => {
        const pairAddress = await ExchangeService.getPair(token, TOKEN_LIST[2].address);
        if (pairAddress !== "0x0000000000000000000000000000000000000000") {
            const tokenZero = await ExchangeService.getTokenZero(pairAddress);
            const tokenOne = await ExchangeService.getTokenOne(pairAddress);
            const reserve = await ExchangeService.getReserves(pairAddress);
            const decimalZero = await ContractServices.getDecimals(tokenZero);
            const decimalOne = await ContractServices.getDecimals(tokenOne);
            let price = 0;
            if (tokenZero.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
                price = ((reserve[0] * (10 ** decimalOne)) / (reserve[1] * (10 ** decimalZero)));
            }
            if (tokenOne.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
                price = ((reserve[1] * (10 ** decimalZero)) / (reserve[0] * (10 ** decimalOne)));
            }
            return price;
        }

        return 0;
    }
    const handleClaimRewards = async () => {
        await LotteryServices.getClaim(tokenIds, isUserConnected, rewards);
    };
    const getAllowance = async () => {
        try {
            const response = Number(
                await ContractServices.allowanceToken(
                    MAIN_CONTRACT_LIST.anchor.address,
                    MAIN_CONTRACT_LIST.lottary.address,
                    isUserConnected
                )
            );

            if (response !== 0) {
                setAllowance(true);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleToggle1 = async () => {
        const value =
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
        setDisabledBUtton(true);
        const response = await ContractServices.approveToken(
            isUserConnected,
            value,
            MAIN_CONTRACT_LIST.lottary.address,
            MAIN_CONTRACT_LIST.anchor.address
        );

        if (response.status) {
            setIButton(true);
            setDisabledBUtton(false);
            setAllowance(true);
        } else {
            setDisabledBUtton(false);
        }
    };
    const onChange = (event) => {
        if (
            event.target.value == "" ||
            (!isNaN(event.target.value) && event.target.value.match("^[^.]+$"))
        ) {
            setvalue(event.target.value);
        }
    };
    const getMax = async () => {
        const contract = await ContractServices.callContract(
            MAIN_CONTRACT_LIST.anchor.address,
            MAIN_CONTRACT_LIST.anchor.abi
        );
        const balance = await contract.methods.balanceOf(isUserConnected).call();
        const value = Math.floor(balance / miniPrice);
        return value;
    };
    const setMax = async () => {
        setvalue(await getMax());
    };
    const generateRandomNumbers = async () => {
        try {
            const contract = await ContractServices.callContract(
                MAIN_CONTRACT_LIST.lottary.address,
                MAIN_CONTRACT_LIST.lottary.abi
            );
            const maxNumber = await contract.methods.maxNumber().call();
            let number;
            let array = [];
            for (let i = 1; i <= 4; i++) {
                number = Math.floor(Math.random() * maxNumber) + 1;
                array = [...array, number];
            }
            return array;
        } catch (error) {
            console.log(error);
        }
    };
    const buyTicket = async () => {
        try {
            if (ticketValue > 0) {
                setBuyButton(true);
                const web3 = await ContractServices.callWeb3();
                const gasPrice = await ContractServices.calculateGasPrice();
                const contract = await ContractServices.callContract(
                    MAIN_CONTRACT_LIST.lottary.address,
                    MAIN_CONTRACT_LIST.lottary.abi
                );
                let value = 0;
                value = await web3.utils.toHex(value);
                const arrayMajor = [];

                for (let number = 1; number <= ticketValue; number++) {
                    arrayMajor.push(await generateRandomNumbers());
                }
                const gas = await contract.methods
                    .multiBuy(`${miniPrice}`, arrayMajor)
                    .estimateGas({ from: isUserConnected, value });
                const response = await contract.methods
                    .multiBuy(`${miniPrice}`, arrayMajor)
                    .send({ from: isUserConnected, gasPrice, gas, value });
                if (response.status) {
                    const amount = await contract.methods.totalAmount().call();
                    setPotDetails({
                        ...potDetails,
                        pot: amount,
                    });
                    setBuyButton(false);
                    setvalue(1);
                    openTicketWindow(!ticketWindow);
                }
                getTicketCurrentIndex();
            } else {
                setvalue(1);
                return toast.error("Ticket should be greater then zero");
            }
        } catch (error) {
            setBuyButton(false);
            console.log(error);
        }
    };
    const harvestAll = async () => {
        const acc = await ContractServices.getDefaultAccount();
        if (acc && acc.toLowerCase() !== isUserConnected.toLowerCase()) {
            return toast.error('Wallet address doesn`t match!');
        }

        if (stakeConfirmation) {
            return toast.info('Transaction is processing!');
        }
        try {
            harvest && harvest.map(async (item) => {
                setStakeConfimation(true);
                const data = {
                    pid: item.pid,
                    amount: 0,
                    referrer: referrer,
                    from: isUserConnected
                }

                dispatch(startLoading());
                const result = await FarmService.deposit(data);
                dispatch(stopLoading());
                setStakeConfimation(false);

                if (result) {
                    setTxHash(result);
                    setShowTransactionModal(true);

                    const data = {
                        message: `Harvest ${item.lpTokenName}`,
                        tx: result
                    };
                    dispatch(addTransaction(data));
                }
            })
            dispatch(stopLoading());
        } catch (err) {
            console.log(err, 'lp harvest');
            dispatch(stopLoading());
            setStakeConfimation(false);

            const message = await ContractServices.web3ErrorHandle(err);
            toast.error(message);
        }
    }
    const calPrice = async (pairAddress) => {

        let price = 0;

        if (pairAddress == "0x0000000000000000000000000000000000000000") {
            return 0;
        }

        // console.log("pairAddresspairAddress", pairAddress);
        const tokenZero = await ExchangeService.getTokenZero(pairAddress);
        const tokenOne = await ExchangeService.getTokenOne(pairAddress);
        const reserve = await ExchangeService.getReserves(pairAddress);

        const decimalZero = await ContractServices.getDecimals(tokenZero);
        const decimalOne = await ContractServices.getDecimals(tokenOne);

        // console.log(tokenZero, TOKEN_LIST[2].address);

        if (tokenZero.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
            return price = ((reserve[0] * (10 ** decimalOne)) / (reserve[1] * (10 ** decimalZero)));
        }

        if (tokenOne.toLowerCase() === TOKEN_LIST[2].address.toLowerCase()) {
            return price = ((reserve[1] * (10 ** decimalZero)) / (reserve[0] * (10 ** decimalOne)));
        }

        let priceBNBToUSD = calPrice(BNB_BUSD_LP);//replace with BNB-USD pair

        if (tokenZero.toLowerCase() === WETH.toLowerCase()) {
            price = ((reserve[0] * (10 ** decimalOne)) / (reserve[1] * (10 ** decimalZero)));
            return (price * priceBNBToUSD);
        }

        if (tokenOne.toLowerCase() === WETH.toLowerCase()) {
            price = ((reserve[1] * (10 ** decimalZero)) / (reserve[0] * (10 ** decimalOne)));
            return (price * priceBNBToUSD);
        }

    }
    const handleTotalLiquidity = async (pairAddress) => {

        if (pairAddress != "0x0000000000000000000000000000000000000000") {
            const tokenZero = await ExchangeService.getTokenZero(pairAddress);
            const tokenOne = await ExchangeService.getTokenOne(pairAddress);
            const reserve = await ExchangeService.getReserves(pairAddress);

            const tokenZeroPairUSDT = await ExchangeService.getPair(tokenZero, TOKEN_LIST[2].address);
            const tokenOnePairUSDT = await ExchangeService.getPair(tokenOne, TOKEN_LIST[2].address);

            const tokenZeroPairBNB = await ExchangeService.getPair(tokenZero, WETH);
            const tokenOnePairBNB = await ExchangeService.getPair(tokenOne, WETH);

            const decimalZero = await ContractServices.getDecimals(tokenZero);
            const decimalOne = await ContractServices.getDecimals(tokenOne);
            // const decimalPair = await ContractServices.getDecimals(pairAddress);

            let priceA = 0;
            let priceB = 0;

            if (tokenZero.toLowerCase() == TOKEN_LIST[2].address.toLowerCase()) {
                priceA = 1;
            } else if (tokenZero.toLowerCase() == WETH.toLowerCase()) {
                priceA = await calPrice(BNB_BUSD_LP);
            }

            if (tokenOne.toLowerCase() == TOKEN_LIST[2].address.toLowerCase()) {
                priceB = 1;
            } else if (tokenOne.toLowerCase() == WETH.toLowerCase()) {
                priceB = await calPrice(BNB_BUSD_LP);
            }

            if (priceA == 0) {
                if (tokenZeroPairUSDT != "0x0000000000000000000000000000000000000000") {
                    priceA = await calPrice(tokenZeroPairUSDT);
                } else if (tokenZeroPairBNB != "0x0000000000000000000000000000000000000000") {
                    priceA = await calPrice(tokenZeroPairBNB);
                } else {
                    priceA = 0;
                }
            }

            if (priceB == 0) {
                if (tokenOnePairUSDT != "0x0000000000000000000000000000000000000000") {
                    priceB = await calPrice(tokenOnePairUSDT);
                } else if (tokenOnePairBNB != "0x0000000000000000000000000000000000000000") {
                    priceB = await calPrice(tokenOnePairBNB);
                } else {
                    priceB = 0;
                }
            }

            const totalSupply = await ExchangeService.getTotalSupply(pairAddress);
            const tokenStaked = await ExchangeService.getTokenStaked(pairAddress);

            const liquidity = ((((reserve[0] / (10 ** decimalZero)) * priceA) + ((reserve[1] / (10 ** decimalOne)) * priceB)) / (totalSupply)) * (tokenStaked);

            return liquidity;
        }
        return 0;
    }
    const { prizeArray, miniPrice, pot, decimals } = potDetails;
    return (
        <div className="container_wrap">
            <div className="container container_inside">
                <div className="row">
                    <div className="col subHeader_style">
                        <img src={anchorswapLogo} />
                        <p>The First Automatic Multichain Liquidity Acquisition Yield Farm & AMM.</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <CardHome
                            className="col_farm_stacking fullHeight"
                            title="Farms & Staking"
                        >
                            <div className="row anchor_swapbtn_metamask_btn lessMargin_bottom">
                                <img src={anchorswapLogoButton} />
                                <Link to="/" className="addMetamask_btn"><img src={addMetamask} /></Link>
                            </div>
                            <div className="col">
                                <div className="row lessMargin_bottom">
                                    <ul className="anchor_harvest_list">
                                        <li className="anchor_harvest_list__title">ANCHOR to Harvest</li>
                                        <li className="anchor_harvest_list__lockedTextStyle">
                                            {farmAndStakeLoader ?
                                                <Loader
                                                    type="Circles"
                                                    color="#FFFFFF"
                                                    height={15}
                                                    width={15}
                                                    visible={true}
                                                // timeout={5000} //3 secs
                                                /> : totalRewards.toFixed(3)
                                            }
                                        </li>
                                        <li className="anchor_harvest_list__valueTextStyle">~${(totalRewards * anchorBusdValue).toFixed(3)}</li>
                                    </ul>
                                </div>
                                <div className="row">
                                    <ul className="anchor_harvest_list">
                                        <li className="anchor_harvest_list__title">ANCHOR in Wallet</li>
                                        <li className="anchor_harvest_list__lockedTextStyle">{addCommas(totalAmount)}</li>
                                        <li className="anchor_harvest_list__valueTextStyle">~${(totalAmount * anchorBusdValue).toFixed(3)}</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="row">
                                {!isUserConnected &&
                                    <div className="col unloack_btn_style">
                                        <Button className="full" onClick={() => setWalletShow(true)}>
                                            {'Unlock Wallet'}
                                        </Button>
                                    </div>}
                                {isUserConnected &&
                                    <div className="col unloack_btn_style">
                                        <Button
                                            onClick={() => {
                                                setShowHarvest(false);
                                                harvestAll();
                                            }}
                                            className="full"
                                            disabled={harvest.length > 0 ? false : true}>
                                            {harvest.length > 0 ? `Harvest All(${harvest.length})` : 'Harvest All'}
                                        </Button>
                                    </div>}
                            </div>
                        </CardHome>
                    </div>
                    <div className="col">
                        <CardHome
                            className="col_lottery_winning_style"
                            classTitle="lottery_title__style"
                            title="Your Lottery Winnings"
                        >
                            <div className="col">
                                <div className="row lessMargin_bottom">
                                    <ul className="lottery_winnig_list">
                                        <li className="lottery_winnig__title">ANCHOR to Collect</li>
                                        <li className="lottery_winnig__value">{rewards ? Math.floor(rewards) : rewards} ANCHOR</li>
                                        <li className="lottery_winnig__valuesmall">~${((rewards ? Math.floor(rewards) : rewards) * anchorBusdValue).toFixed(3)}</li>
                                    </ul>
                                </div>
                                <div className="row">
                                    <ul className="lottery_winnig_list">
                                        <li className="lottery_winnig__title">Total Jackpot This Round</li>
                                        <li className="lottery_winnig__value">{pot / 10 ** decimals}</li>
                                        <li className="lottery_winnig__valuesmall">~${((pot / 10 ** decimals) * anchorBusdValue).toFixed(3)}</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="row">
                                {!isUserConnected && (
                                    <div className="col unloack_btn_style">
                                        <Button className="full" onClick={() => setWalletShow(true)}>
                                            {'Unlock Wallet'}
                                        </Button>
                                    </div>)}
                                {(isUserConnected && rewards != 0) && (
                                    <div className="col unloack_btn_style">
                                        <Button onClick={() => handleClaimRewards()} className="full">
                                            {'Collect Winnings'}
                                        </Button>
                                    </div>
                                )}
                                {(isUserConnected && !rewards) && (
                                    <div className="col unloack_btn_style">
                                        <Button className="full" disabled>
                                            {'Collect Winnings'}
                                        </Button>
                                    </div>
                                )}
                                {(isUserConnected && allowance) && (
                                    <div className="col unloack_btn_style">
                                        <Button className="full" onClick={() => openTicketWindow(!ticketWindow)}>
                                            {'Buy Tickets'}
                                        </Button>
                                    </div>
                                )}
                                {(isUserConnected && !allowance) && (
                                    <div className="col unloack_btn_style">
                                        <Button className="full"
                                            disabled={disable}
                                            onClick={() => handleToggle1()}
                                        >
                                            {'Approve Anchor'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHome>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <CardHome
                            className="announcements_cardStyle"
                            title="Announcements"
                        >
                            <div className="row">
                                <div className="col twitter-col">
                                    <TwitterTimelineEmbed
                                        sourceType="profile"
                                        screenName="AnchorSwap"
                                        options={{ height: 520 }}
                                        theme="dark"
                                        noScrollbar={true}

                                    />
                                </div>
                            </div>
                        </CardHome>
                    </div>
                    <div className="col">
                        <CardHome
                            className="mb-26"
                            title="ANCHOR Stats"
                        >
                            <div className="row">
                                <div className="col">
                                    <ul className="list_ValueStyle">
                                        <li>
                                            <span className="label">Market Cap</span>
                                            <strong className="value">${addCommas(marketCap.toFixed(2))}</strong>
                                        </li>
                                        <li>
                                            <span className="label">Total Minted</span>
                                            <strong className="value">{addCommas(totalMinted.toFixed(2))}</strong>
                                        </li>
                                        <li>
                                            <span className="label">Total Burned</span>
                                            <strong className="value">{addCommas(burnedToken)}</strong>
                                        </li>
                                        <li>
                                            <span className="label">Total Locked Rewards</span>
                                            <strong className="value">
                                                {farmAndStakeLoader ?

                                                    <Loader
                                                        type="Circles"
                                                        color="#FFFFFF"
                                                        height={15}
                                                        width={15}
                                                        visible={true}
                                                    // timeout={5000} //3 secs
                                                    /> : addCommas(totalLockedRewards.toFixed(2))
                                                }
                                            </strong>
                                        </li>
                                        <li>
                                            <span className="label">Circulating Supply</span>
                                            <strong className="value">{addCommas((totalMinted - burnedToken).toFixed(2))}</strong>
                                        </li>
                                        <li>
                                            <span className="label">Max Tx Amount</span>
                                            <strong className="value">{addCommas(anchorTotalSupply.toFixed(2))}</strong>
                                        </li>
                                        <li>
                                            <span className="label">New ANCHOR/Block</span>
                                            <strong className="value">{addCommas(anchorPerBlock)}</strong>
                                        </li>
                                        <li>
                                            <span className="label">Transfer Tax</span>
                                            <strong className="value">{"2.5%"}</strong>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardHome>
                        {/* <CardHome
                            className="mb-26"
                            title="ANCHOR LP Worth"
                            classTitle="small"
                        >
                            <div className="row">
                                <div className="col">
                                    <ul className="list_ValueStyle">
                                        <li>
                                            <span className="label">ANCHOR-BNB</span>
                                            <strong className="value">${anchorBnbWorth.toFixed(2)}</strong>
                                        </li>
                                        <li>
                                            <span className="label">ANCHOR-BUSD</span>
                                            <strong className="value">${anchorBusdWorth.toFixed(2)}</strong>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardHome> */}
                        <CardHome
                            className="totalValueLocked_style"
                            title="Total Value Locked (TVL)"
                            classTitle="small"
                        >
                            <div className="row">
                                <div className="col">
                                    <p> {farmAndStakeLoader ?
                                        <Loader
                                            type="Circles"
                                            color="#FFFFFF"
                                            height={15}
                                            width={15}
                                            visible={true}
                                        // timeout={5000} //3 secs
                                        /> : addCommas(liquidity.toFixed(2))
                                    }</p>
                                    <strong>Across all Farms and Pools</strong>

                                </div>
                            </div>
                        </CardHome>
                    </div>
                </div>

            </div>
            {walletShow &&
                <WalletList isWalletShow={() => setWalletShow()} />
            }
            {ticketWindow && (
                <span className="show">
                    <div className="ticketpopup show">
                        <div className="ticketpop">
                            <h3>Enter amount of tickets to buy</h3>
                            <Button
                                className="close"
                                onClick={() => openTicketWindow(!ticketWindow)}
                            ></Button>
                            <div className="popup_body">
                                <div className="amountBox">
                                    <input
                                        onChange={(e) => onChange(e)}
                                        value={ticketValue}
                                        type="text"
                                        className="form-control"
                                    />
                                    <h4>
                                        Ticket
                                        <Button
                                            className="btn-max"
                                            onClick={() => setMax()}
                                        >
                                            Max
                                        </Button>
                                    </h4>
                                </div>
                                <p>1 Ticket = 20 ANCHOR</p>
                                <p className="white">
                                    Ticket purchases are final. Your ANCHOR cannot
                                    be returned to you after buying tickets.
                                </p>
                                <p className="center spnd-txt">
                                    You will spend: {""}
                                    {ticketValue * (miniPrice / 10 ** decimals)}
                                    ANCHOR
                                </p>
                                <ul>
                                    <li>
                                        <Button
                                            onClick={() => {
                                                openTicketWindow(!ticketWindow);
                                            }}
                                            className="noticket show"
                                        >
                                            Cancel
                                        </Button>
                                    </li>
                                    <li>
                                        <Button
                                            disabled={buyButton}
                                            onClick={() => buyTicket()}
                                        >
                                            {buyButton
                                                ? "Pending Confirmation"
                                                : "Confirm"}
                                        </Button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </span>
            )}
        </div>
    )

}

export default Home