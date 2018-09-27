/* global fetch */
import { Component } from 'react';
import Chart from 'react-chartjs-2';
import PropTypes from 'prop-types';
import { stringify } from 'query-string';
import SETTINGS from '../../settings';

// XXX: Less than ideal solution
const COLORS = ['#4040e8', '#05b378', '#db4437', '#f8b128', '#5c5c5c'];

const backendTelemetryUrl = (id, queryParams) => (
  `${SETTINGS.backend}/api/perf/telemetry?${stringify({ name: id, ...queryParams })}`);

const chartJsOptions = (reverse, scaleLabel) => ({
  scales: {
    xAxes: [
      {
        type: 'time',
        time: {
          displayFormats: {
            hour: 'MMM D',
          },
        },
      },
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          reverse,
        },
        scaleLabel: {
          display: true,
          labelString: scaleLabel,
        },
      },
    ],
  },
});

const dataToChartJSformat = data =>
  data.map(({ date, value }) => ({
    x: date,
    y: value,
  }));

const telemetryDataToChartJS = (backendData) => {
  const { datas, description, legendLabels, params, yLabel } = backendData;
  const datasets = [];
  datas.forEach((data, index) => {
    datasets.push({
      label: legendLabels[index],
      backgroundColor: COLORS[index],
      data: dataToChartJSformat(data),
    });
  });
  return {
    datasets: { datasets },
    options: chartJsOptions(false, `${yLabel} ${params.metric}`),
  };
};

class TelemetryGraphContainer extends Component {
  state = {
    datasets: null,
  }

  async componentDidMount() {
    this.fetchPlotGraph(this.props.id, this.props.queryParams);
  }

  async fetchPlotGraph(id, queryParams) {
    const url = backendTelemetryUrl(id, queryParams);
    const { graphData, telemetryUrl } = await (await fetch(url)).json();
    this.setState(telemetryDataToChartJS(graphData));
  }

  render() {
    const { datasets, options } = this.state;
    if (!datasets) {
      return <div />;
    }
    return (
      <Chart
        type="scatter"
        data={datasets}
        height={50}
        options={options}
      />
    );
  }
}

TelemetryGraphContainer.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  queryParams: PropTypes.shape({}),
};

export default TelemetryGraphContainer;
