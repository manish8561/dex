import React,{useEffect, useState} from 'react'
import './ModalSelectTokenStyle.scss'
import { ContractServices } from '../../services/ContractServices'
import { useSelector } from 'react-redux'

const TokenBalance = ({ address }) => {
    const [balance, setBalance] = useState('');
    const isUserConnected = useSelector(state => state.persist.isUserConnected);


    useEffect(() => {
        init();
    }, [isUserConnected]);

    const init = async () => {
        try {
                let res = 0;
                if (address === 'BNB') {
                    res = await ContractServices.getBNBBalance(isUserConnected);
                    setBalance(res);
                } else {
                    res = await ContractServices.getTokenBalance(address, isUserConnected);
                    setBalance(res);
                }
        } catch (error) {
            console.log(error);
        }
    }
    return <span className="tokenName_textStyle">{balance}</span>

}

export default TokenBalance;