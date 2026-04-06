
let count = 5;
let currentRole = "viewer";

let totalIncome = 0;
let totalExpense = 0;
let balance = 0;

let categoryData = {};
let monthlyData = {}; 


document.getElementById("role").addEventListener("change", function () {
    currentRole = this.value;
});


let lineChart = new Chart(document.getElementById("balanceChart"), {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Balance",
            data: [],
            borderColor: "blue",
            fill: false
        }]
    }
});

let pieChart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: ['green','red','orange','blue','pink','purple']
        }]
    }
});


let monthlyChart = new Chart(document.getElementById("monthlyChart"), {
    type: "bar",
    data: {
        labels: [],
        datasets: [
            {
                label: "Income",
                data: [],
                backgroundColor: "green"
            },
            {
                label: "Expense",
                data: [],
                backgroundColor: "red"
            }
        ]
    }
});


window.onload = function () {
    recalculateAll();
};


function bnt_transation() {

    if (currentRole !== "Admin") {
        alert("Only Admin can add/edit");
        return;
    }

    let desc = document.getElementById("desc").value.trim();
    let amtInput = document.getElementById("amt").value.trim();

    if (desc === "" || amtInput === "") return;

    let num = parseFloat(amtInput);
    if (isNaN(num)) return;

    let date = new Date().toLocaleDateString();

    let type = num > 0 ? "Income" : "Expense";
    let color = num > 0 ? "green" : "red";

    let row = `
    <tr>
        <td>${count}</td>
        <td>${date}</td>
        <td>${desc}</td>
        <td>${Math.abs(num)}</td>
        <td style="color:${color}; font-weight:bold;">${type}</td>
        <td><button onclick="editRow(this)">Edit</button></td>
    </tr>
    `;

    document.getElementById("tab").innerHTML += row;
    count++;

    recalculateAll();

    document.getElementById("desc").value = "";
    document.getElementById("amt").value = "";
}


function editRow(btn) {

    if (currentRole !== "Admin") {
        alert("Only Admin can edit");
        return;
    }

    let row = btn.parentElement.parentElement;

    let newDesc = prompt("Edit Description", row.children[2].innerText);
    let newAmt = parseFloat(prompt("Edit Amount", row.children[3].innerText));

    if (!newDesc || isNaN(newAmt)) return;

    let type = newAmt > 0 ? "Income" : "Expense";
    let color = newAmt > 0 ? "green" : "red";

    row.children[2].innerText = newDesc;
    row.children[3].innerText = Math.abs(newAmt);
    row.children[4].innerText = type;
    row.children[4].style.color = color;

    recalculateAll();
}


function recalculateAll() {

    totalIncome = 0;
    totalExpense = 0;
    categoryData = {};
    monthlyData = {};

    let rows = document.querySelectorAll("#tab tr");

    rows.forEach(row => {

        let desc = row.children[2].innerText.trim();
        let amt = parseFloat(row.children[3].innerText);
        let type = row.children[4].innerText.trim();
        let date = new Date(row.children[1].innerText);
        let month = date.getMonth() + 1 + "/" + date.getFullYear(); // e.g., 4/2026

        if (type === "Income") {
            totalIncome += amt;
            if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
            monthlyData[month].income += amt;
        } else {
            totalExpense += amt;
            if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
            monthlyData[month].expense += amt;
        }

        if (!categoryData[desc]) categoryData[desc] = 0;
        categoryData[desc] += amt;
    });

    balance = totalIncome - totalExpense;

    document.getElementById("value-in").innerText = "₹" + totalIncome;
    document.getElementById("value-ex").innerText = "₹" + totalExpense;
    document.getElementById("value-Balance").innerText = "₹" + balance;

    rebuildCharts();
    updateInsights();
}


function rebuildCharts() {

    let rows = document.querySelectorAll("#tab tr");

    let runningBalance = 0;

    let labels = ['Start'];
    let data = [0];

    rows.forEach((row, i) => {

        let amt = parseFloat(row.children[3].innerText);
        let type = row.children[4].innerText.trim();

        if (type === "Income") {
            runningBalance += amt;
        } else {
            runningBalance -= amt;
        }

        labels.push("T" + (i + 1));
        data.push(runningBalance);
    });

    lineChart.data.labels = labels;
    lineChart.data.datasets[0].data = data;
    lineChart.update();

  
    pieChart.data.labels = Object.keys(categoryData);
    pieChart.data.datasets[0].data = Object.values(categoryData);
    pieChart.update();
}

function updateInsights() {


    let maxCategory = "";
    let maxValue = 0;

    for (let key in categoryData) {
        if (categoryData[key] > maxValue) {
            maxValue = categoryData[key];
            maxCategory = key;
        }
    }

    document.getElementById("highest-spend").innerText =
        maxCategory ? `Highest Spending Category: ${maxCategory} (₹${maxValue}) `: "No data";

    
    let months = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b));
    let incomeArr = months.map(m => monthlyData[m].income);
    let expenseArr = months.map(m => monthlyData[m].expense);

    monthlyChart.data.labels = months;
    monthlyChart.data.datasets[0].data = incomeArr;
    monthlyChart.data.datasets[1].data = expenseArr;
    monthlyChart.update();

  
    let savingsPercent = totalIncome ? ((balance / totalIncome) * 100).toFixed(2) : 0;
    document.getElementById("other-observation").innerText =
        `You saved ${savingsPercent}% of your total income.`;
}

let ck = document.getElementById("Dashboard");
ck.addEventListener("click",()=>{
    window.scrollTo({
  bottom:1800,
  behavior:"smooth"
    })
})