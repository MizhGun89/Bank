/* eslint-disable no-unused-expressions */
/* eslint-disable array-callback-return */
/* eslint-disable no-new */
import { el, setChildren } from 'redom';
import {
  getLastMonthData,
  formattedMonth,
  createLastTransactions,
} from './page-account';
import Chart from 'chart.js/auto';

function getBalanceRatio(data, lastMonth) {
  const dataAccount = data.account;
  const allTransactions = data.transactions;

  const result = [];

  const currentDate = new Date();
  let year = currentDate.getFullYear();

  let month;
  const months = [];

  for (let i = 0; i < lastMonth; i++) {
    month = currentDate.getMonth() - i + 1;
    if (month <= 0) {
      month += 12;
      year--;
    }
    month = month.toString().padStart(2, '0');
    months.push(year + '-' + month);
  }

  const monthBalances = [];
  months.forEach((month) => {
    monthBalances.push({
      month,
      received: 0,
      sent: 0,
      balance: 0,
    });
  });

  allTransactions.forEach((transaction) => {
    monthBalances.forEach((item) => {
      if (transaction.date.includes(item.month)) {
        dataAccount === transaction.to
          ? (item.received += transaction.amount)
          : (item.sent += transaction.amount);
        item.balance += transaction.amount;
      }
    });
  });
  monthBalances.forEach((item) => {
    result.unshift({
      label: formattedMonth(item.month.slice(-2)),
      data: [Number(item.received.toFixed(2)), Number(item.sent.toFixed(2))],
    });
  });
  return result;
}

export function createCurrentLastTransaction(data, page) {
  const x = 25;
  const startIndexOfTransaction = x * (page - 1);
  const lastIndexOfTransaction = x * page;
  createLastTransactions(data, startIndexOfTransaction, lastIndexOfTransaction);
}

export function createAccountDetails(data) {
  const id = data.account;

  const url = new URL('/accounts/account-details', window.location.origin);
  const params = new URLSearchParams(url.search);

  const storageID =
    sessionStorage.getItem('id') === null ? id : sessionStorage.getItem('id');
  const storagePage =
    sessionStorage.getItem('page') === null
      ? 1
      : sessionStorage.getItem('page');
  const pageNumber = storageID === id ? storagePage : 1;

  params.set('id', id);
  storageID === id ? params.set('page', pageNumber) : params.set('page', 1);

  url.search = params.toString();
  history.pushState(null, '', url);

  const data1 = getLastMonthData(data, 12);
  const accountContainerBlock = document.querySelector(
    '#account__container-block'
  );
  accountContainerBlock.innerHTML = '';
  accountContainerBlock.classList.add('flex-column');

  const balanceDinamics = el(
    '.details__contsiner-chart',
    el('h3.account__card-title', 'Динамика баланса'),
    el(
      'div',
      { style: { display: 'flex' } },
      el(
        'div',
        {
          style: {
            display: 'flex',
            'flex-direction': 'column',
            'margin-right': '24px',
            width: '100%',
          },
        },
        el('canvas#myCharDetails', { style: { height: '165px' } }),
        el('#myCharMonthDetails')
      ),
      el('#myCharValueDetails')
    )
  );

  const balanceRatio = el(
    '.details__contsiner-chart',
    el('h3.account__card-title', 'Соотношение входящих исходящих транзакций'),
    el(
      'div',
      { style: { display: 'flex' } },
      el(
        'div',
        {
          style: {
            display: 'flex',
            'flex-direction': 'column',
            'margin-right': '24px',
            width: '100%',
          },
        },
        el('canvas#myCharRatio', {
          style: { height: '165px', width: '1000px' },
        }),
        el('#myCharMonthRatio')
      ),
      el('#myCharValueRatio')
    )
  );

  setChildren(accountContainerBlock, [balanceDinamics, balanceRatio]);

  document.querySelector('.account__btn-back').addEventListener('click', () => {
    window.location.href = `http://localhost:8080/accounts/account?id=${id}`;
  });

  const dataValue = [];
  const dataMonthValueArr = [];
  const dataMonthValueArr1 = [];
  data1.forEach((item) => {
    dataValue.push(Number(item.value));
    dataMonthValueArr.push(el('p', item.month.slice(0, 3)));
    dataMonthValueArr1.push(el('p', item.month.slice(0, 3)));
  });
  const maxDataValue = Math.max(...dataValue);

  setChildren(document.querySelector('#myCharValueDetails'), [
    el('p', maxDataValue),
    el('p', 0),
  ]);
  setChildren(document.querySelector('#myCharMonthDetails'), dataMonthValueArr);

  setChildren(document.querySelector('#myCharValueRatio'), [
    el('p', maxDataValue),
    el('p', 0),
  ]);
  setChildren(document.querySelector('#myCharMonthRatio'), dataMonthValueArr1);

  new Chart(document.getElementById('myCharDetails'), {
    type: 'bar',
    options: {
      animation: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
        },
      },
      scales: {
        yAxis: {
          display: false,
          position: 'right',
          max: maxDataValue,
          ticks: {
            stepSize: maxDataValue,
          },
          grid: {
            display: false,
          },
        },
        xAxis: {
          display: false,
          grid: {
            display: false,
          },
        },
      },
    },
    data: {
      labels: data1.map((row) => row.month),
      datasets: [
        {
          label: 'Баланс',
          data: data1.map((row) => row.value),
          backgroundColor: '#116ACC',
          yAxisID: 'yAxis',
          xAxisID: 'xAxis',
        },
      ],
    },
  });

  const data2 = getBalanceRatio(data, 12);

  new Chart(document.getElementById('myCharRatio'), {
    type: 'bar',
    options: {
      plugins: {
        title: {
          display: false,
        },
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
        },
      },
      responsive: true,

      scales: {
        yAxis: {
          stacked: true,
          display: false,
          grid: {
            display: false,
          },
          max: maxDataValue,
        },
        xAxis: {
          stacked: true,
          display: false,
          grid: {
            display: false,
          },
        },
      },
    },
    data: {
      labels: data2.map((el) => el.label),
      datasets: [
        {
          label: 'Получено',
          data: data2.map((el) => el.data[0]),
          backgroundColor: '#76CA66',
          yAxisID: 'yAxis',
          xAxisID: 'xAxis',
        },
        {
          label: 'Отправлено',
          data: data2.map((el) => el.data[1]),
          backgroundColor: '#FD4E5D',
          yAxisID: 'yAxis',
          xAxisID: 'xAxis',
        },
      ],
    },
  });
  createCurrentLastTransaction(data, pageNumber);

  document
    .querySelector('.account__history-container')
    .classList.remove('cursor-pointer');
}
