import React, { useState, useEffect, Fragment } from "react";
import Countdown from "react-countdown";
import "./Lottery.scss";
import ProgressBar from "./ProgressBar";
import anchor_total from "../../../assets/images/anchor_total.png";
import Button from "../../../Components/Button/Button";
import ticket from "../../../assets/images/ticket_bg.png";
import anchor from "../../../assets/images/anchor_total.png";
import { LotteryServices } from "../../../services/LotteryServices";
import { useSelector } from "react-redux";
import { toast } from "../../../Components/Toast/Toast";
import { ContractServices } from "../../../services/ContractServices";
import { UserService } from "../../../services/UserService";
import { MAIN_CONTRACT_LIST } from "../../../assets/tokens";
import Card from "../../../Components/Card/Card";
import LotteryChart from "./LotteryChart";
import { API_HOST } from "../../../constant";
import Loader from "react-loader-spinner";
import Table from "react-bootstrap/Table";

const testData = [{ bgcolor: "#E3D42E", completed: 55 }];

//Change IP
const Lottery = () => {
  const isUserConnected = useSelector((state) => state.persist.isUserConnected);
  const [potDetails, setPotDetails] = useState({
    prizeArray: [0, 0, 0],
    miniPrice: 0,
    pot: 0,
    decimals: 0,
  });

  const [oldWinnigDetails, setOldWinnigDetails] = useState({
    oldWinningArray: [0, 0, 0, 0],
    rewardArray: [0, 0, 0, 0],
    time: "",
  });

  const [IButton, setIButton] = useState(false);
  const [nextDraws, pastDraws] = useState(true);
  const [curentTickets, showCurrentTickets] = useState(false);
  const [disable, setDisabledBUtton] = useState(false);
  const [ticketWindow, openTicketWindow] = useState(false);
  const [ticketValue, setvalue] = useState(1);
  const [buyButton, setBuyButton] = useState(false);
  const [winningarray, setwinningarray] = useState([0, 0, 0, 0]);
  const [currentTicketsArray, setCurrentArray] = useState([]);
  const [allowance, setAllowance] = useState(false);
  const [isActive, setActive] = useState(true);
  const [page, setPage] = useState([1]);
  const [winningNumbers, setWinningNumbers] = useState([0, 0, 0]);
  const [issueIndex, setCurrentIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [index, getFetcheIndex] = useState();
  const [loader, setLoader] = useState(false);
  const [rewards, seRewards] = useState(0);
  const [tokenIds, setTokenIds] = useState();

  useEffect(() => {
    totalPotSize();
    getLotteryData();
  }, []);

  useEffect(() => {
    if (isUserConnected) {
      getAllowance();
      getTicketCurrentIndex();
    }
  }, [isUserConnected]);

  const { prizeArray, miniPrice, pot, decimals } = potDetails;
  const { oldWinningArray, rewardArray, time } = oldWinnigDetails;

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

  const getLotteryData = async () => {
    try {
      const contract = await ContractServices.callContract(
        MAIN_CONTRACT_LIST.lottary.address,
        MAIN_CONTRACT_LIST.lottary.abi
      );

      const issueIndex = await contract.methods.issueIndex().call();
      const index = issueIndex - 1 < 0 ? 0 : issueIndex - 1;
      setCurrentIndex(index);
      setRound(index);
      getFetcheIndex(index);
      getOldDetails(index, true);
      getRewards(index);
    } catch (error) {
      console.log(error);
    }
  };

  const getRewards = async (index) => {
    const response = await LotteryServices.getRewards(isUserConnected, index);
    if (response) {
      setTokenIds(response.tokenIds);
      seRewards(response.totalRewards);
    }
  };

  const getTicketCurrentIndex = async () => {
    setLoader(true);
    const response = await LotteryServices.getCurrentTickets(isUserConnected);
    setCurrentArray(response);
    setLoader(false);
  };

  const totalPotSize = async () => {
    const address = await ContractServices.isMetamaskInstalled();
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
        toast.error("Something went wrong!");
      }
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

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

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

  const handleToggle = () => {
    if (!isUserConnected) {
      return toast.error("Connect to your wallet!");
    }
    setActive(!isActive);
  };

  const onChange = (event) => {
    if (
      event.target.value == "" ||
      (!isNaN(event.target.value) && event.target.value.match("^[^.]+$"))
    ) {
      setvalue(event.target.value);
    }
    if(event.target.value > 50) {
      setvalue("50");
      return toast.error("Can't buy more then 50 tickets at a time")
    }
  };

  const onChangeIssueIndex = async (event) => {
    if (
      event.target.value === "" ||
      (!isNaN(event.target.value) &&
        event.target.value.match("^[^.]+$") &&
        event.target.value <= issueIndex)
    ) {
      setRound(event.target.value);
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

  const burnedTokens = () => {
    const total = pot / 10 ** decimals;
    let rewards = 0;
    for (let i = 0; i <= 2; i++) {
      rewards += (pot * prizeArray[i]) / (100 * 10 ** decimals);
    }
    return (total - rewards).toFixed(4);
  };

  const oldBurnedTokens = () => {
    const total = rewardArray[0] / 10 ** decimals;

    let rewards = 0;
    for (let i = 0; i <= 2; i++) {
      rewards += (rewardArray[0] * prizeArray[i]) / (100 * 10 ** decimals);
    }
    return Math.trunc(total - rewards);
  };
  const Completionist1 = () => <span>Can't buy ticket now</span>;
  const Completionist2 = () => <span>Lottery draw in progress</span>;

  const getOldDetails = async (index, setWinningNumberOnLoad) => {
    try {
      const { data } = await UserService.getLotteryDetails(index);

      if (data && data.data) {
        setOldWinnigDetails({
          oldWinningArray: data.data.numbers1,
          rewardArray: data.data.numbers2,
          time: data.data.drawTime * 1000,
        });
        getFetcheIndex(index);
        if (setWinningNumberOnLoad) {
          const response = (await UserService.getHistoryNumbers(1, 25)).data;
          setPage(response.totalPage);
          setwinningarray(data.data.numbers1);
          setWinningNumbers([
            data.data.numbers2[1],
            data.data.numbers2[2],
            data.data.numbers2[3],
          ]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    getOldDetails(round, false);
  };

  const resetPastDraws = () => {
    pastDraws(true);
    setRound(issueIndex);
    getOldDetails(issueIndex, false);
  };
  const handleClaimRewards = async () => {
    await LotteryServices.getClaim(tokenIds, isUserConnected, rewards);
  };

  const getFriday = () => {
    let day = new Date().getDay();
    let comingFriday = new Date();
    let t;
    if (day <= 5) {
      t = new Date().getDate() + (6 - new Date().getDay() - 1);
    } else {
      t = new Date().getDate() + (6 - new Date().getDay() - 1) + 7;
    }
    comingFriday.setDate(t);
    comingFriday = Math.trunc(comingFriday / 86400000);
    comingFriday = comingFriday * 86400000;
    comingFriday = comingFriday + 17 * 3600 * 1000;
    let timestamp = comingFriday - Date.now();
    return timestamp;
  };

  const getProgressPercent = () => {
    let number = (getFriday() / 86400000 / 7) * 100;
    number = Math.ceil(number);
    return number;
  };

  return (
    <div className="container_wrap container_Lottery">
      {console.log(rewardArray,prizeArray,pot , prizeArray[0],100 * 10 ** decimals)}

      <div className="LoteryHeader">
        <div className="LoteryHeaderLeft">
          <h2>The ANCHOR Lottery</h2>
          <p>
            Buy tickets with ANCHOR <br />
            Win if 2, 3 or 4 of your ticket numbers match !
          </p>
        </div>
        <div className="LoteryHeaderRight">
          {testData.map((item, idx) => (
            <ProgressBar
              key={idx}
              bgcolor={item.bgcolor}
              completed={getProgressPercent()}
            />
          ))}
          <p>
            <Countdown date={Date.now() + getFriday()}>
              <Completionist1 />
            </Countdown>{" "}
            Until ticket sale <br />
            <Countdown date={Date.now() + getFriday() + 3600 * 1000}>
              <Completionist2 />
            </Countdown>{" "}
            Unit lottery draw
          </p>
        </div>
      </div>
      <div className="container ">
        <div className="LoteryPage">
          <div className="TopTabs">
            <ul>
              <li>
                <Button
                  className={nextDraws && "active"}
                  onClick={() => resetPastDraws()}
                >
                  Next draw
                </Button>
              </li>
              <li>
                <Button
                  className={!nextDraws && "active"}
                  onClick={() => pastDraws(false)}
                >
                  Past draws
                </Button>
              </li>
            </ul>
          </div>
          {nextDraws && (
            <Fragment>
              <div className="totalPot">
                <div className="totalPotIn totalPotLeft">
                  <div className="totalPotHead">
                    <img src={anchor_total} alt="icon" />
                    <h3>
                      <span>Total Pot</span>
                      {pot / 10 ** decimals} ANCHOR
                    </h3>
                  </div>

                  <div className="totalPotbody">
                    <ul>
                      <li>
                        No. Matched<span>Prize Pot</span>
                      </li>
                      <li>
                        4
                        <span>
                          {(
                            (pot * prizeArray[0]) /
                            (100 * 10 ** decimals)
                          ).toFixed(4)}
                        </span>
                      </li>
                      <li>
                        3
                        <span>
                          {(
                            (pot * prizeArray[1]) /
                            (100 * 10 ** decimals)
                          ).toFixed(4)}
                        </span>
                      </li>
                      <li>
                        2
                        <span>
                          {(
                            (pot * prizeArray[2]) /
                            (100 * 10 ** decimals)
                          ).toFixed(4)}
                        </span>
                      </li>
                      <li>
                        To burn:
                        <span>{burnedTokens()}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="totalPotIn tickets_box">
                    {isUserConnected ? (
                      <div className="show">
                        <h3>Your tickets for this round</h3>
                        {loader && (
                          <Loader
                            type="Puff"
                            color="#FFFFFF"
                            height={60}
                            width={60}
                            visible={true}
                            // timeout={5000} //3 secs
                          />
                        )}
                        <h3>
                          {currentTicketsArray && currentTicketsArray.length}
                        </h3>
                        <ul>
                          <li>
                            <Button
                              disabled={
                                currentTicketsArray &&
                                currentTicketsArray.length == 0
                              }
                              onClick={() => showCurrentTickets(true)}
                              className="noticket"
                            >
                              View Your tickets
                            </Button>
                          </li>

                          <li>
                            {allowance ? (
                              <Button
                                onClick={() => openTicketWindow(!ticketWindow)}
                              >
                                Buy Ticket
                              </Button>
                            ) : (
                              <Button
                                disabled={disable}
                                onClick={handleToggle1}
                              >
                                Approve Anchor
                              </Button>
                            )}
                          </li>
                        </ul>
                      </div>
                    ) : (
                      <div className={isActive ? "show" : "hide"}>
                        <h3>Unlock wallet to access lottery</h3>
                        <ul>
                          <li>
                            <a onClick={handleToggle} href="#">
                              Unlock Wallet
                            </a>
                          </li>
                        </ul>
                      </div>
                    )}

                    <div className="hide">
                      <h3>Your tickets for this round</h3>
                      <ul>
                        <li>
                          <a href="#">View your tickets</a>
                        </li>
                        <li>
                          <a href="#">Buy ticket</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="totalPotIn ticket-price">
                    <div className="show">
                      {rewards ? (
                        <h3>You have won : {Math.floor(rewards)}</h3>
                      ) : (
                        ""
                      )}
                      {rewards ? (
                        <Button onClick={() => handleClaimRewards()}>
                          Claim Rewards
                        </Button>
                      ) : (
                        ""
                      )}
                      {!rewards ? (
                        <ul>
                          <li>
                            <p className="tick-pr">Sorry no price to collect</p>
                            <a
                              disabled={
                                currentTicketsArray &&
                                currentTicketsArray.length == 0
                              }
                              onClick={() => showCurrentTickets(true)}
                              className="noticket yellow"
                            >
                              View Your tickets
                            </a>
                          </li>
                        </ul>
                      ) : (
                        ""
                      )}
                    </div>

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
                              <small style={{color:"red"}}>*Note: Can't buy tickets more then 50 at a time</small>

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
                                    className="lotteryConfirm_btn"
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
                    <div className="hide">
                      <h3>Your tickets for this round</h3>
                      <ul>
                        <li>
                          <a href="#">View your tickets</a>
                        </li>
                        <li>
                          <a href="#">Buy ticket</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="fullBox">
                <h3>Latest Winning Number</h3>
                <div className="fullBoxbody">
                  <ul className="counts">
                    {winningarray.map((elem, index) => (
                      <li key={index}>{elem}</li>
                    ))}
                  </ul>
                  <p>
                    Tickets matching 4 numbers:{" "}
                    {miniPrice !== 0 ? winningNumbers[0] / miniPrice : 0}
                    <br />
                    Tickets matching 3 numbers:{" "}
                    {miniPrice !== 0 ? winningNumbers[1] / miniPrice : 0}
                    <br />
                    Tickets matching 2 numbers:{" "}
                    {miniPrice !== 0 ? winningNumbers[2] / miniPrice : 0}
                  </p>
                  <a
                    target="blank"
                    href={`${API_HOST}drawing/getAll/${page}/25`}
                  >
                    Export recent winning numbers
                  </a>
                </div>
              </div>
              <div className="fullBox">
                <h3>How It Works</h3>
                <div className="fullBoxbody">
                  <p>
                    Spend ANCHOR to buy tickets, contributing to the lottery
                    pot. Win prizes if 2, 3, or 4 of your ticket numbers <br />
                    match the winning numbers and their exact order!
                  </p>
                  <a
                    target="_blank"
                    href="https://docs.anchorswap.finance/products/#lottery"
                  >
                    Read more
                  </a>
                </div>
              </div>
            </Fragment>
          )}
        </div>
        {!nextDraws && (
          <Fragment>
            <div className="pastdraw">
              <div className="pastdrawLeft">
                <p>Select lottery number:</p>
                <div className="loterySearch">
                  <form>
                    <input
                      value={round}
                      onChange={(e) => onChangeIssueIndex(e)}
                      type="text"
                      className="sc-kfzAmx fFPurj"
                    />
                    <Button onClick={(e) => onSubmit(e)}>Search</Button>
                  </form>
                </div>
                <div className="lotterydrawbox">
                  <h3>
                    Round #{index}{" "}
                    {time != "" && (
                      <span>
                        {months[new Date(time).getMonth()]}{" "}
                        {new Date(time).getDate()}, 18 : 00 UTC
                      </span>
                    )}
                  </h3>
                  <ul className="totalnumber">
                    <li>
                      <img src={ticket} alt="" />
                      <h3>
                        <span>Winning numbers</span>

                        {oldWinningArray.map((elem) => ` ${elem}`)}
                      </h3>
                    </li>
                    <li>
                      <img src={anchor} alt="" />
                      <h3>
                        <span>Total prizes</span>
                        {rewardArray[0] / 10 ** decimals} ANCHOR
                      </h3>
                    </li>
                  </ul>
                  <div className="table-responsive">
                    <Table className="match-table">
                      <thead>
                        <tr>
                          <th>No. Matched</th>
                          <th>Winners</th>
                          <th>Prize pot</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>4</td>
                          <td>{rewardArray[1] / miniPrice}</td>
                          <td>  
                            {" "}
                            <span>
                              {Number((
                                (rewardArray[0] * prizeArray[0]) /
                                (100 * 10 ** decimals)
                              ).toFixed(4))}
                            </span>
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>3</td>
                          <td>{rewardArray[2] / miniPrice}</td>
                          <td>
                            <span>
                              {Math.trunc(
                                (rewardArray[0] * prizeArray[1]) /
                                  (100 * 10 ** decimals)
                              )}
                            </span>
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>{rewardArray[3] / miniPrice}</td>
                          <td>
                            <span>
                              {Math.trunc(
                                (rewardArray[0] * prizeArray[2]) /
                                  (100 * 10 ** decimals)
                              )}
                            </span>
                          </td>
                          <td></td>
                        </tr>

                        <tr>
                          <td> Burned :{"  "}</td>
                          <td></td>
                          <td>
                            <span>{oldBurnedTokens()}</span>
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
              <div className="pastdrawRight">
                <div className="lotterydrawbox">
                  <h3>History</h3>
                  <LotteryChart decimals={decimals} />
                </div>
              </div>
            </div>
          </Fragment>
        )}
      </div>
      {IButton && (
        <Fragment>
          <div className="backdrop"></div>
          <Card className="selectCurrency_modal ticketpop  warning-modal">
            <Button className="close" onClick={() => setIButton(false)}>
              Cross
            </Button>

            <div className="col modal_headerStyle">
              <div className="row modal_headerStyle__rowA lessMargin_bottom">
                <div className="  ">
                  <h2>Warning</h2>
                </div>
              </div>
            </div>
            <p>
              Lottery ticket purchases are final. Your Anchor will not be
              returned to you after you spend it to buy tickets. Tickets are
              only valid for one lottery draw, and will be burned after the
              draw. Buying tickets does not guarantee you will win anything.
              Please only participate once you understand the risks.
            </p>

            <div className="col modal_headerStyle__rowA_colRight">
              <Button onClick={() => setIButton(false)}>I UNDERSTAND</Button>
            </div>
          </Card>
        </Fragment>
      )}

      {curentTickets && (
        <Fragment>
          <div className="backdrop"></div>
          <Card className="selectCurrency_modal viewTickets">
            <h3 className="ticket-heading">
              My Tickets {`(Total: ${currentTicketsArray.length})`}
            </h3>
            <Button
              className="close"
              onClick={() => showCurrentTickets(false)}
            ></Button>
            <div className="col modal_headerStyle">
              <div className="row modal_headerStyle__rowA lessMargin_bottom">
                <div className="  modal_headerStyle__rowA_colLeft">
                  {currentTicketsArray.map((outerElem, index) => (
                    <>
                      {/* <p key={index}> </p> */}
                      <div key={index} className="token-name">
                        <h2>{outerElem.toString()}</h2>
                      </div>
                    </>
                  ))}
                </div>
                <div className="col modal_headerStyle__rowA_colRight"></div>
              </div>
            </div>

            <Button onClick={() => showCurrentTickets(false)}>Close</Button>
          </Card>
        </Fragment>
      )}
    </div>
  );
};

export default Lottery;
