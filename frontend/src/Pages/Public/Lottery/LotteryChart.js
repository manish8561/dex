import React, { useEffect, useState } from "react";
import Chart from "react-google-charts";
import { UserService } from "../../../services/UserService";

const LotteryChart = ({ decimals }) => {
  const [values, setValues] = useState([["", "Pool Size", "Burned"]]);
  useEffect(() => {
    getChartData();
  }, []);

  const getChartData = async () => {
    let response = (await UserService.getChartDetails()).data.data;
    if (response.length > 0) {
      let arr = values;
      for (let elem of response) {
        elem.issueIndex = Number(elem.issueIndex);
        elem.pot = Number(elem.pot) / 10 ** decimals;
        elem.burned = Number(elem.pot * 10) / 100;
        arr = [...arr, Object.values(elem)];
        setValues(arr);
      }
    }
  };

  return values.length === 1 ? (
    <div>
      {" "}
      {console.log(values, values.length)}
      <p>No data</p>
    </div>
  ) : (
    <Chart
      className="lotteryChart"
      width={"100%"}
      height={"400px"}
      chartType="Line"
      loader={<div>Loading Chart</div>}
      data={values}
      backgroundColor="#121827"
      options={{
        backgroundColor: "#121827",
        chart: {
          // title: "History",
          backgroundColor: "#121827",
        },
        series: {
          0: { axis: "pool_size" },
          1: { axis: "Burned" },
        },
        axes: {
          y: {
            pool_size: { label: "Pool Size", backgroundColor: "red" },

            Burned: { label: "Burned", backgroundColor: "blue" },
          },
        },
      }}
      rootProps={{ "data-testid": "4" }}
    />
  );
};

export default LotteryChart;
