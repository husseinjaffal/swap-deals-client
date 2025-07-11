import React, { useState } from 'react';

function App() {
  const [deals, setDeals] = useState([]);
  const [carrierFilter, setCarrierFilter] = useState('');
  const [directionFilter, setDirectionFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [totals, setTotals] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setDeals(data);
  };

  const handleRateChange = (index, newRate) => {
    const updated = [...deals];
    updated[index].Rate = parseFloat(newRate);
    setDeals(updated);
  };

  const handleLiveCostChange = (index, newCost) => {
    const updated = [...deals];
    updated[index].LiveCost = parseFloat(newCost);
    setDeals(updated);
  };

  const handleNetRateChange = (index, newNet) => {
    const updated = [...deals];
    updated[index].NetRate = parseFloat(newNet);
    setDeals(updated);
  };

  const calculateTotals = () => {
    let inRevenue = 0, inMargin = 0, outRevenue = 0, outLoss = 0;

    deals.forEach((deal) => {
      const passed = parseFloat(deal.Passed || 0);
      const rate = parseFloat(deal.Rate || 0);
      const live = parseFloat(deal.LiveCost || 0);
      const net = parseFloat(deal.NetRate || 0);
      const dir = (deal.Direction || '').toUpperCase();

      if (dir === 'IN') {
        inRevenue += passed * rate;
        inMargin += (rate - live) * passed;
      }
      if (dir === 'OUT') {
        outRevenue += passed * rate;
        outLoss += (rate - net) * passed;
      }
    });

    const netProfitPercent = inRevenue > 0 ? ((inMargin - outLoss) / inRevenue) * 100 : 0;

    setTotals({
      inRevenue,
      inMargin,
      outRevenue,
      outLoss,
      netProfitPercent,
    });
  };

  const filteredDeals = deals.filter((deal) => {
    const carrier = (deal.Carrier || '').toLowerCase();
    const dir = (deal.Direction || '').toLowerCase();
    const manager = (deal.Manager || '').toLowerCase();

    return (
      carrier.includes(carrierFilter.toLowerCase()) &&
      dir.includes(directionFilter.toLowerCase()) &&
      manager.includes(managerFilter.toLowerCase())
    );
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>📊 Swap Deals Analyzer</h1>
      <input type="file" onChange={handleFileChange} />
      <input placeholder="Filter by Carrier" onChange={(e) => setCarrierFilter(e.target.value)} />
      <input placeholder="Filter by Manager" onChange={(e) => setManagerFilter(e.target.value)} />
      <select onChange={(e) => setDirectionFilter(e.target.value)}>
        <option value="">Direction</option>
        <option value="IN">IN</option>
        <option value="OUT">OUT</option>
      </select>
      <button onClick={calculateTotals}>Calculate Totals</button>

      <table border="1" cellPadding="6" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Carrier</th>
            <th>Direction</th>
            <th>Destination</th>
            <th>Passed</th>
            <th>Rate</th>
            <th>Live Cost</th>
            <th>Net Rate</th>
            <th>IN Rev</th>
            <th>IN Margin</th>
            <th>OUT Rev</th>
            <th>OUT Loss</th>
            <th>Manager</th>
          </tr>
        </thead>
        <tbody>
          {filteredDeals.map((d, i) => {
            const passed = parseFloat(d.Passed || 0);
            const rate = parseFloat(d.Rate || 0);
            const live = parseFloat(d.LiveCost || 0);
            const net = parseFloat(d.NetRate || 0);
            const dir = (d.Direction || '').toUpperCase();

            const inRev = dir === 'IN' ? passed * rate : 0;
            const inMargin = dir === 'IN' ? (rate - live) * passed : 0;
            const outRev = dir === 'OUT' ? passed * rate : 0;
            const outLoss = dir === 'OUT' ? (rate - net) * passed : 0;

            return (
              <tr key={i}>
                <td>{d.Carrier}</td>
                <td>{d.Direction}</td>
                <td>{d.Destination}</td>
                <td>{passed}</td>
                <td>
                  <input
                    type="number"
                    step="0.0001"
                    value={rate}
                    onChange={(e) => handleRateChange(i, e.target.value)}
                  />
                </td>
                <td>
                  {dir === 'IN' ? (
                    <input
                      type="number"
                      step="0.0001"
                      value={live}
                      onChange={(e) => handleLiveCostChange(i, e.target.value)}
                    />
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {dir === 'OUT' ? (
                    <input
                      type="number"
                      step="0.0001"
                      value={net}
                      onChange={(e) => handleNetRateChange(i, e.target.value)}
                    />
                  ) : (
                    '—'
                  )}
                </td>
                <td>€{inRev.toFixed(2)}</td>
                <td>€{inMargin.toFixed(2)}</td>
                <td>€{outRev.toFixed(2)}</td>
                <td>€{outLoss.toFixed(2)}</td>
                <td>{d.Manager}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totals && (
        <div style={{ marginTop: 20 }}>
          <h3>📈 Summary</h3>
          <p>IN Revenue: €{totals.inRevenue.toFixed(2)}</p>
          <p>IN Margin: €{totals.inMargin.toFixed(2)}</p>
          <p>OUT Revenue: €{totals.outRevenue.toFixed(2)}</p>
          <p>OUT Loss: €{totals.outLoss.toFixed(2)}</p>
          <p>Net Profit %: {totals.netProfitPercent.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}

export default App;
