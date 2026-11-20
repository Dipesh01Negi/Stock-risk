let portfolio = [];
let chart = null;
let stockList = [];

const $ = id => document.getElementById(id);
const money = n => "$" + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

async function getJSON(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error("Request failed: " + url);
  return response.json();
}

function showError(message) {
  $("alerts").innerHTML = `<div class="notice notice-error">${message}</div>`;
}

async function init() {
  $("today-label").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  });

  try {
    stockList = await getJSON("/api/stocks");
    $("stock-select").innerHTML = stockList.map(s =>
      `<option value="${s.ticker}">${s.ticker} · ${s.name} (${money(s.price)})</option>`
    ).join("");

    const model = await getJSON("/api/model");
    showModel(model);
    if (stockList.length) showChart(stockList[0].ticker);
    showLogs();
  } catch (error) {
    showError("Could not load dashboard data. Check that the Flask server is running and the data files are available.");
    $("model-badge").textContent = "Model unavailable";
  }
}

function addStock() {
  const stock = $("stock-select").value;
  const shares = Number($("shares").value);

  if (!stock || !Number.isInteger(shares) || shares < 1) {
    alert("Enter a valid number of shares.");
    return;
  }

  portfolio = portfolio.filter(item => item.stock !== stock);
  portfolio.push({ stock, shares });
  renderPortfolio();
}

function removeStock(index) {
  portfolio.splice(index, 1);
  renderPortfolio();
}

async function loadSample() {
  try {
    portfolio = await getJSON("/api/sample-portfolio");
    renderPortfolio();
  } catch (error) {
    showError("Could not load the sample portfolio.");
  }
}

function renderPortfolio() {
  $("holding-count").textContent = portfolio.length;
  $("holdings").innerHTML = portfolio.length
    ? portfolio.map((item, index) => `
        <li>
          <span><b>${item.stock}</b><small>${item.shares} shares</small></span>
          <button class="remove-button" onclick="removeStock(${index})" aria-label="Remove ${item.stock}">Remove</button>
        </li>`).join("")
    : `<li class="holdings-empty">Your selected stocks will appear here.</li>`;
}

async function analyze() {
  if (!portfolio.length) {
    alert("Add at least one stock first.");
    return;
  }

  const button = document.querySelector(".button-analyze");
  button.disabled = true;
  button.innerHTML = "Analyzing portfolio...";

  try {
    const data = await getJSON("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolio })
    });

    $("total").textContent = money(data.summary.total);
    $("level").innerHTML = `<span class="risk-label ${data.summary.risk}">${data.summary.risk}</span>`;
    $("alert-count").textContent = data.alerts.length;

    $("alerts").innerHTML = data.alerts.length
      ? data.alerts.map(message => `<div class="notice notice-warning"><span>!</span>${message}</div>`).join("")
      : `<div class="notice notice-success"><span>✓</span>No portfolio alerts at this time.</div>`;

    $("results").innerHTML = data.results.map(item => `
      <tr onclick="showChart('${item.stock}')" tabindex="0">
        <td><strong>${item.stock}</strong></td>
        <td>${money(item.value)}</td>
        <td>${item.weight}%</td>
        <td><span class="risk-label ${item.risk}">${item.risk}</span></td>
        <td>
          <div class="confidence-cell">
            <div class="confidence-track"><span style="width:${item.confidence}%"></span></div>
            <small>${item.confidence}%</small>
          </div>
        </td>
      </tr>`).join("");

    showLogs();
  } catch (error) {
    showError("Portfolio analysis failed. Check the selected stocks and backend terminal for details.");
  } finally {
    button.disabled = false;
    button.innerHTML = 'Analyze portfolio <span>→</span>';
  }
}

async function showChart(ticker) {
  try {
    const history = await getJSON("/api/history/" + encodeURIComponent(ticker));
    $("chart-title").textContent = ticker + " price history";

    if (chart) chart.destroy();

    chart = new Chart($("chart"), {
      type: "line",
      data: {
        labels: history.dates,
        datasets: [{
          data: history.prices,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 10,
          fill: true,
          tension: 0.25
        }]
      },
      options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 7, color: "#8993a5" } },
          y: { grid: { color: "#edf0f5" }, ticks: { color: "#8993a5" } }
        }
      }
    });
  } catch (error) {
    $("chart-title").textContent = "Price history unavailable";
  }
}

function showModel(model) {
  const test = model.test_scores || {};
  const validation = model.validation_scores || model.scores || {};
  const accuracy = test.accuracy ?? model.accuracy;
  const f1 = test.f1 ?? model.f1;
  const rows = [
    ["Selected model", model.best_model || "—"],
    ["Test accuracy", accuracy == null ? "—" : (accuracy * 100).toFixed(1) + "%"],
    ["Test F1 score", f1 == null ? "—" : Number(f1).toFixed(3)],
    ["Training rows", model.train_rows ?? "—"],
    ["Validation models", Object.keys(validation).length || "—"],
    ["Last trained", model.trained_at || "—"]
  ];

  $("model-badge").textContent = model.best_model
    ? model.best_model + (accuracy == null ? "" : " · " + (accuracy * 100).toFixed(1) + "%")
    : "Model report loaded";

  $("model-info").innerHTML = rows.map(row => `
    <div class="metric-row"><span>${row[0]}</span><strong>${row[1]}</strong></div>
  `).join("");
}

async function showLogs() {
  try {
    const logs = await getJSON("/api/logs");
    $("logs").innerHTML = logs.length
      ? logs.map(item => `
          <tr>
            <td>${item.time}</td>
            <td><strong>${item.stock}</strong></td>
            <td><span class="risk-label ${item.risk}">${item.risk}</span></td>
            <td>${item.confidence}%</td>
          </tr>`).join("")
      : `<tr><td colspan="4" class="table-empty">No predictions recorded yet.</td></tr>`;
  } catch (error) {
    $("logs").innerHTML = `<tr><td colspan="4" class="table-empty">Could not load activity.</td></tr>`;
  }
}

init();
