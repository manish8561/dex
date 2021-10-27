import React, { useState, useEffect } from 'react'
import { withRouter } from "react-router"
import { useDispatch, useSelector } from "react-redux"
import { Link } from 'react-router-dom'
import Card from '../../../Components/Card/Card'
import Button from '../../../Components/Button/Button'
import InputSelectCurrency from '../../../Components/InputSelectCurrency/InputSelectCurrency'
import icon_bnb from '../../../assets/images/icon_bnb.svg'
import awesomePlus from '../../../assets/images/awesome-plus.svg'
import coinAnchor from '../../../assets/images/icon_coinAnchor.png'
import coinbusd from '../../../assets/images/busd-token-icon-outline.svg'
import awesomeArrowLeft from '../../../assets/images/awesome-arrow-left.svg'
import ModalSelectToken from '../../../Components/ModalSelectToken/ModalSelectToken'
import { ContractServices } from "../../../services/ContractServices"
import { addLpToken, searchTokenByNameOrAddress, startLoading, stopLoading } from "../../../redux/actions"
import { toast } from '../../../Components/Toast/Toast';
import { ExchangeService } from '../../../services/ExchangeService'
import { TOKEN_LIST, WETH } from '../../../assets/tokens'
import closeBtn from '../../../assets/images/ionic-md-close.svg'
import './ImportPool.scss'
import TokenBalance from "../../../Components/ModalSelectToken/TokenBalance"

const ImportPool = props => {
    const dispatch = useDispatch();
    const isUserConnected = useSelector(state => state.persist.isUserConnected);
    const tokenList = useSelector(state => state.persist.tokenList);

    const [modalCurrency, setModalCurrency] = useState(false);
    const [tokenOne, setTokenOne] = useState(TOKEN_LIST[0]);
    const [tokenTwo, setTokenTwo] = useState({});
    const [tokenOneCurrency, setCurrencyNameForTokenOne] = useState(TOKEN_LIST[0].symbol);
    const [tokenTwoCurrency, setCurrencyNameForTokenTwo] = useState('Select a currency');
    const [tokenOneValue, setTokenOneValue] = useState(0);
    const [tokenTwoValue, setTokenTwoValue] = useState(0);

    const [lpTokenBalance, setLpTokenBalance] = useState(0);
    const [tokenType, setTokenType] = useState('TK1');

    const [search, setSearch] = useState("");
    const [filteredTokenList, setFilteredTokenList] = useState([]);

    const [selectedCurrency, setSelectedCurrency] = useState('');

    const [currentPairAddress, setCurrentPairAddress] = useState('');


    useEffect(() => {
        setFilteredTokenList(tokenList.filter((token) => token.name.toLowerCase().includes(search.toLowerCase())));
    }, [search, tokenList]);

    const onHandleOpenModal = (tokenType) => {
        if (!isUserConnected) {
            return toast.error('Connect wallet first!');
        }
        setSelectedCurrency(tokenType === 'TK1' ? tokenTwoCurrency : tokenOneCurrency);
        setModalCurrency({ modalCurrency: true, });
        setTokenType(tokenType);
    }
    const onHandleSelectCurrency = async (token, selecting) => {
        const { address, symbol } = token;
        let pairName = '';
        if (!isUserConnected) {
            return toast.error('Connect wallet first!');
        }
        let a1, a2;
        if (selecting === 'TK1') {
            a1 = address;
            setTokenOne(token);
            setCurrencyNameForTokenOne(symbol);
            pairName = `${symbol}/${tokenTwoCurrency} LP`;

            if (tokenTwo.address) {
                a2 = tokenTwo.address;
            }
        }
        if (selecting === 'TK2') {
            a2 = address;

            setTokenTwo(token);
            setCurrencyNameForTokenTwo(symbol);
            pairName = `${tokenOneCurrency}/${symbol} LP`;

            if (tokenOne.address) {
                a1 = tokenOne.address;
            }
        }
        setModalCurrency(!modalCurrency);
        setSearch('');
        setFilteredTokenList(tokenList);

        if (a1 && a2) {
            dispatch(startLoading());
            let currentPairAddress;
            if (a1 === 'BNB') {
                a1 = WETH;//WETH
                currentPairAddress = await ExchangeService.getPair(a1, a2);
            } else if (a2 === 'BNB') {
                a2 = WETH;//WETH
                currentPairAddress = await ExchangeService.getPair(a1, a2);
            } else {
                currentPairAddress = await ExchangeService.getPair(a1, a2);
            }
            if (currentPairAddress !== '0x0000000000000000000000000000000000000000') {
                const tk0 = await ExchangeService.getTokenZero(currentPairAddress);
                const tk1 = await ExchangeService.getTokenOne(currentPairAddress);

                const lpdata = {
                    pair: currentPairAddress,
                    decimals: 18,
                    name: "Import LPs",
                    pairName,
                    symbol: "Anchor-LP",
                    token0: tk0,
                    token1: tk1,
                }
                
                const result = await dispatch(addLpToken(lpdata));
                if (result) {
                    setLpTokenBalance(result.balance);
                    setCurrentPairAddress(currentPairAddress);
                    setTokenOneValue(result.token0Deposit);
                    setTokenTwoValue(result.token1Deposit);
                }
            } else {
                setLpTokenBalance(0);
                setCurrentPairAddress('');
                setTokenOneValue(0);
                setTokenTwoValue(0);
            }
            dispatch(stopLoading());
        }
    }

    const handleSearchToken = async (data) => {
        try {
            const res = await dispatch(searchTokenByNameOrAddress(data));
            setFilteredTokenList(res);
        } catch (error) {
            toast.error("Something went wrong!");
        }
    }
    return (
        <>
            <Card>
                <div className="col container_swapwrap__header liquidity_header">
                    <Link to="#" onClick={props.backBtn} className="linkBack"><img src={awesomeArrowLeft} alt="icon" /></Link>
                    <h2>Import Pool</h2>
                </div>
                <div className="col importpool">
                    <div className="importpoolbox" onClick={() => onHandleOpenModal('TK1')} >
                        <img src={tokenOne.icon} alt="icon" /> <p>{tokenOne.symbol}</p>
                    </div>

                    <div className="Col btnSwap">
                        <button className="btnSwapStyle">
                            <img src={awesomePlus} alt="icon" />
                        </button>
                    </div>
                    <div className="importpoolbox" onClick={() => onHandleOpenModal('TK2')} >
                        {tokenTwo.address ?
                            <>
                                <img src={tokenTwo?.icon} alt="icon" />
                                <p>{tokenTwo?.symbol}</p>
                            </>
                            :
                            <p>Select a Token</p>}
                    </div>
                    {(tokenOne.address && tokenTwo.address) ?
                        currentPairAddress ?
                            <div className="importpooldetails">
                                <p>Pool Found!</p>
                                <h4>LP TOKENS IN YOUR WALLET</h4>
                                <ul>
                                    <li><p><img src={tokenOne.icon} alt="icon" /> <img src={tokenTwo.icon} alt="icon" /> {tokenOne.symbol}/{tokenTwo?.symbol}</p> <span>{lpTokenBalance.toFixed(5)}</span></li>
                                    <li><p>{tokenOne.symbol}: </p><TokenBalance address={tokenOne.address} /></li>
                                    <li><p>{tokenTwo?.symbol}:</p><TokenBalance address={tokenTwo.address} /></li>
                                </ul>
                            </div>
                            :
                            <div className="importpooldetails">
                                <p>No pool found</p>
                                <p>
                                    <Link to="#" onClick={() => props.addBtn()}>Create pool</Link>
                                </p>
                                <br />
                            </div>
                        :
                        <div className="importpooldetails">
                            <p>Select a token to find your liquidity.</p>
                            <br />
                        </div>}
                </div>
            </Card>

            {modalCurrency &&
                <ModalSelectToken
                    tokenList={filteredTokenList}
                    closeModal={() => setModalCurrency(!modalCurrency)}
                    selectCurrency={onHandleSelectCurrency}
                    searchToken={handleSearchToken}
                    searchByName={setSearch}
                    tokenType={tokenType}
                    handleOrder={setFilteredTokenList}
                    currencyName={selectedCurrency}
                />}
        </>
    )
}


export default withRouter(ImportPool);

