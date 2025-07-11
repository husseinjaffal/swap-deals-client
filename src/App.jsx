import React, { useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function App() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ carrier: "", direction: "", manager: "" });
  const [totals, setTotals] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState("€");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("http://localhost:5000/upload", formData);
    setData(res.data);
    setTotals(null);
  };

  const updateLiveCost = (id, value) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, liveCost: parseFloat(value) || 0 } : row
      )
    );
  };

  const updateRate = (id, value) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, rate: parseFloat(value) || 0 } : row
      )
    );
  };

  const filtered = data.filter((row) => {
    return (
      (filters.direction === "" || row.direction === filters.direction.toUpperCase()) &&
      (filters.carrier === "" || row.carrier.toLowerCase().includes(filters.carrier.toLowerCase())) &&
      (filters.manager === "" || row.accountManager.toLowerCase().includes(filters.manager.toLowerCase()))
    );
  });

  const calculateTotals = () => {
    const total = {
      inRevenue: 0,
      inMargin: 0,
      outRevenue: 0,
      outLoss: 0,
    };
    filtered.forEach((row) => {
      const inRevenue = row.direction === "IN" ? row.rate * row.passed : 0;
      const inMargin = row.direction === "IN" ? (row.rate - row.liveCost) * row.passed : 0;
      const outRevenue = row.direction === "OUT" ? row.rate * row.passed : 0;
      const outLoss = row.direction === "OUT" ? (row.rate - row.netRate) * row.passed : 0;

      total.inRevenue += inRevenue;
      total.inMargin += inMargin;
      total.outRevenue += outRevenue;
      total.outLoss += outLoss;
    });
    total.netProfitPercent = total.inRevenue
      ? ((total.inMargin - total.outLoss) / total.inRevenue) * 100
      : 0;
    setTotals(total);
  };

  const formatCurrency = (value, decimals = 4) =>
    `${currencySymbol}${parseFloat(value).toFixed(decimals)}`;

  return (
    <div className="p-4 font-sans text-sm">
      <h1 className="text-2xl font-bold mb-4">📊 Swap Deals Analyzer</h1>

      <div className="flex gap-4 mb-4 flex-wrap">
        <input type="file" onChange={handleUpload} />
        <input
          placeholder="Filter by Carrier"
          className="border px-2 py-1"
          onChange={(e) => setFilters({ ...filters, carrier: e.target.value })}
        />
        <input
          placeholder="Filter by Manager"
          className="border px-2 py-1"
          onChange={(e) => setFilters({ ...filters, manager: e.target.value })}
        />
        <select
          className="border px-2 py-1"
          onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
        >
          <option value="">Direction</option>
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </select>

        <button
          className="bg-blue-600 text-white px-4 py-1 rounded"
          onClick={calculateTotals}
        >
          Calculate Totals
        </button>

        <button
          className="bg-purple-600 text-white px-3 py-1 rounded"
          onClick={() => setCurrencySymbol(currencySymbol === "€" ? "$" : "€")}
        >
          Switch to {currencySymbol === "€" ? "USD ($)" : "EUR (€)"}
        </button>
      </div>

      {totals && (
        <div className="mb-6 bg-gray-100 p-4 rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-2">📈 Summary Totals</h2>
          <p>IN Revenue: {formatCurrency(totals.inRevenue, 2)}</p>
          <p>IN Margin: {formatCurrency(totals.inMargin, 2)}</p>
          <p>OUT Revenue: {formatCurrency(totals.outRevenue, 2)}</p>
          <p>OUT Net Loss: {formatCurrency(totals.outLoss, 2)}</p>
          <p>
            Net Profit %:{" "}
            <span className={totals.netProfitPercent >= 0 ? "text-green-700" : "text-red-700"}>
              {totals.netProfitPercent.toFixed(2)}%
            </span>
          </p>
        </div>
      )}

      <table className="w-full border text-xs mb-8">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-2 py-1">Carrier</th>
            <th className="border px-2 py-1">Direction</th>
            <th className="border px-2 py-1">Destination</th>
            <th className="border px-2 py-1">Passed</th>
            <th className="border px-2 py-1">Rate</th>
            <th className="border px-2 py-1">Live Cost</th>
            <th className="border px-2 py-1">Net Rate</th>
            <th className="border px-2 py-1">IN Rev</th>
            <th className="border px-2 py-1">IN Margin</th>
            <th className="border px-2 py-1">OUT Rev</th>
            <th className="border px-2 py-1">OUT Loss</th>
            <th className="border px-2 py-1">Manager</th>
            <th className="border px-2 py-1">⚠️</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => {
            const inRevenue = row.direction === "IN" ? row.rate * row.passed : 0;
            const inMargin = row.direction === "IN" ? (row.rate - row.liveCost) * row.passed : 0;
            const outRevenue = row.direction === "OUT" ? row.rate * row.passed : 0;
            const outLoss = row.direction === "OUT" ? (row.rate - row.netRate) * row.passed : 0;
            const alert = inMargin > 100 && outLoss > 100;

            return (
              <tr key={row.id} className={alert ? "bg-red-100" : ""}>
                <td className="border p-1">{row.carrier}</td>
                <td className="border p-1">{row.direction}</td>
                <td className="border p-1">{row.destination}</td>
                <td className="border p-1">{row.passed}</td>

                <td className="border p-1">
                  <input
                    type="number"
                    step="0.0001"
                    value={row.rate}
                    onChange={(e) => updateRate(row.id, e.target.value)}
                    className="w-20 border px-1"
                  />
                </td>

                <td className="border p-1">
                  {row.direction === "IN" ? (
                    <input
                      type="number"
                      step="0.0001"
                      value={row.liveCost}
                      onChange={(e) => updateLiveCost(row.id, e.target.value)}
                      className="w-20 border px-1"
                    />
                  ) : (
                    "-"
                  )}
                </td>

                <td className="border p-1">{formatCurrency(row.netRate)}</td>
                <td className="border p-1">{formatCurrency(inRevenue, 2)}</td>
                <td className="border p-1 text-green-700">{formatCurrency(inMargin, 2)}</td>
                <td className="border p-1">{formatCurrency(outRevenue, 2)}</td>
                <td className="border p-1 text-red-700">{formatCurrency(outLoss, 2)}</td>
                <td className="border p-1">{row.accountManager}</td>
                <td className="border p-1 text-center">{alert ? "⚠️" : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totals && (
        <div className="w-full max-w-xl mx-auto">
          <Bar
            data={{
              labels: ["IN Revenue", "IN Margin", "OUT Revenue", "OUT Net Loss"],
              datasets: [
                {
                  label: currencySymbol,
                  data: [
                    totals.inRevenue,
                    totals.inMargin,
                    totals.outRevenue,
                    totals.outLoss,
                  ],
                  backgroundColor: ["#3b82f6", "#16a34a", "#f59e0b", "#dc2626"],
                },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
