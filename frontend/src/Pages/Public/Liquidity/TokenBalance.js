import React from 'react'
import '../../../Components/ModalSelectToken/ModalSelectTokenStyle.scss'

const TokenBalance = ({ address, balance }) => {
    // const [balance, setBalance] = useState('');
    // useEffect(() => {
    //     init();
    // }, []);
    // const init = async () => {
    //     try {
    //             let res = 0;
    //             if (address === 'BNB') {
    //                 res = await ContractServices.getBNBBalance(isUserConnected);
    //                 setBalance(res);
    //             } else {
    //                 res = await ContractServices.getTokenBalance(address, isUserConnected);
    //                 setBalance(res);
    //             }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    return <span className="tokenName_textStyle">{Number(balance.toFixed(5))}</span>

}

export default TokenBalance;