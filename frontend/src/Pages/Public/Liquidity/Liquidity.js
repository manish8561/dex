import React, { useState } from 'react'
import '../Swap/Swap.scss'
import StepsSwap from '../../../Components/StepsSwap/StepsSwap'
import AddLiquidity from './AddLiquidity'
import ImportPool from './ImportPool'
import LiquidityDefault from './LiquidityDefault'
import RemoveLiquidity from './RemoveLiquidity'
import { toast } from '../../../Components/Toast/Toast'
import { useSelector } from 'react-redux'


const Liquidity = () => {
    const [colLiquidity, setColLiquidity] = useState(1);
    const isUserConnected = useSelector(state => state.persist.isUserConnected);
    const [lptoken, setLptoken] = useState(null);

    const handleComponent = (value) => {
        if (!isUserConnected) {
            return toast.error('Connect wallet first!');
        }
        setColLiquidity(value)
    }
    const handleAddLiquidity = (lp) => {
        if (!isUserConnected) {
            return toast.error('Connect wallet first!');
        }
        setLptoken(lp);
        setColLiquidity(2);
    }
    const handleRemove = (lp) => {
        if (!isUserConnected) {
            return toast.error('Connect wallet first!');
        }
        setLptoken(lp);
        setColLiquidity(4);
    }

    return (
        <div className="container_swapwrap">
            <div className="container container_inside">
                <StepsSwap
                    // firstStep="isActive"
                    secondStep="isActive"
                />
                {colLiquidity === 1 && <LiquidityDefault handleClick={handleComponent} handleAddLiquidity={handleAddLiquidity} handleRemove={handleRemove} />}
                {colLiquidity === 2 && <AddLiquidity backBtn={() => setColLiquidity(1)} lptoken={lptoken} />}
                {colLiquidity === 3 && <ImportPool backBtn={() => setColLiquidity(1)} handleAddLiquidity={handleAddLiquidity} />}
                {colLiquidity === 4 && <RemoveLiquidity backBtn={() => setColLiquidity(1)} lptoken={lptoken} />}
            </div>
        </div>
    )
}

export default Liquidity