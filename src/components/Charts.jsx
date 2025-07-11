import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Charts = ({ filteredDeals }) => {
  const inDeals = filteredDeals.filter(d => d.direction?.toUpperCase() === 'IN');
  const outDeals = filteredDeals.filter(d => d.direction?.toUpperCase() === 'OUT');

  const getValues = (deals, valueFn) => deals.map(deal => {
    const passed = Number(deal.passed) || 0;
    const rate = Number(deal.rate) || 0;
    return valueFn(deal, rate, passed);
  });

  const labels = filteredDeals.map((deal, idx) => `${deal.carrier || 'Unknown'}-${deal.destination || ''}`.slice(0, 25));

  const inMargins = getValues(inDeals, (deal, rate, passed) => {
    const liveCost = Number(deal.liveCost || 0);
    return (rate - liveCost) * passed;
  });

  const outLosses = getValues(outDeals, (deal, rate, passed) => {
    const netRate = Number(deal.netRate || 0);
    return (rate - netRate) * passed;
  });

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>📈 IN Margins</h3>
      <Bar
        data={{
          labels: labels.slice(0, inMargins.length),
          datasets: [
            {
              label: 'IN Margin ($)',
              data: inMargins,
              backgroundColor: 'rgba(75,192,192,0.6)',
            }
          ]
        }}
        options={{ responsive: true }}
      />

      <h3 style={{ marginTop: '2rem' }}>📉 OUT Losses</h3>
      <Bar
        data={{
          labels: labels.slice(0, outLosses.length),
          datasets: [
            {
              label: 'OUT Loss ($)',
              data: outLosses,
              backgroundColor: 'rgba(255,99,132,0.6)',
            }
          ]
        }}
        options={{ responsive: true }}
      />
    </div>
  );
};

export default Charts;
