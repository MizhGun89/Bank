/* eslint-disable no-new */
import createHeader from './header';
import { el, setChildren, mount } from 'redom';
import { postTransferFunds } from './main';
import { getToken } from './tokenStore';
import accounting from 'accounting';
import bootstrapBundleMin from 'bootstrap/dist/js/bootstrap.bundle.min';
import { createTooltip } from './page-currency';
import Chart from 'chart.js/auto';
import {
  createAccountDetails,
  createCurrentLastTransaction,
} from './page-account-details';

const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
// eslint-disable-next-line no-unused-vars
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrapBundleMin.Tooltip(tooltipTriggerEl)
);

function createCurrentMoneyFormat(num) {
  return accounting.formatMoney(num, '₽', 2, ' ', '.', '%v %s');
}

export function formattedMonth(num) {
  const month = num;
  const options = { month: 'long' };
  const formattedMonth = new Intl.DateTimeFormat('ru-RU', options).format(
    new Date(0, month - 1)
  );
  return formattedMonth;
}

export function getLastMonthData(data, lastMonth) {
  const result = [];

  const allTransactions = data.transactions;

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

  const monthBalances = {};
  months.forEach((month) => {
    monthBalances[month] = 0;
  });

  allTransactions.forEach((elem) => {
    for (const month in monthBalances) {
      if (elem.date.includes(month)) {
        monthBalances[month] += elem.amount;
        break;
      }
    }
  });

  for (const month in monthBalances) {
    monthBalances[month] = Number(monthBalances[month].toFixed(2));
    const formattedMonthValue = formattedMonth(month.slice(-2));
    const value = Number(monthBalances[month].toFixed(2));
    result.push({ month: formattedMonthValue, value });
  }
  return result.reverse();
}

function removeDuplicates(array) {
  const uniqueArray = [...new Set(array)];
  return uniqueArray;
}

function postAutocompletionList(accountId) {
  const account = accountId;
  let savedData = localStorage.getItem('autocomplite');
  savedData = savedData ? JSON.parse(savedData) : [];
  savedData.push(account);
  savedData = removeDuplicates(savedData);
  localStorage.setItem('autocomplite', JSON.stringify(savedData));
}

function createAutocompletionList() {
  const getSavedData = localStorage.getItem('autocomplite');
  const autocompliteArr = getSavedData ? JSON.parse(getSavedData) : [];
  const result = [];
  autocompliteArr.forEach((elem) => {
    const listItem = el(
      'li',
      el('a.dropdown-item.account__dropdown-item', elem)
    );
    result.push(listItem);
  });
  return result;
}

function createPagination(data, numOfPages) {
  const url = new URL(window.location);
  const searchParams = new URLSearchParams(url.search);
  let pagesBtnArr = [];

  for (let i = 0; i < numOfPages; i++) {
    pagesBtnArr.push(
      el(
        'li.page-item',
        el('a.page-link', `${i + 1}`, { href: '#accountTitle' })
      )
    );
  }
  pagesBtnArr.unshift(
    el('li.page-item', el('a.page-link', '<<', { href: '#accountTitle' }))
  );
  pagesBtnArr.push(
    el('li.page-item', el('a.page-link', '>>', { href: '#accountTitle' }))
  );

  pagesBtnArr.forEach((page) => {
    const pageNumber = page.childNodes[0].textContent;
    pageNumber === searchParams.get('page')
      ? page.classList.add('active')
      : page.classList.remove('active');

    page.addEventListener('click', function (e) {
      const nowPage = Number(searchParams.get('page'));
      e.preventDefault();
      if (pageNumber !== '<<' && pageNumber !== '>>') {
        searchParams.set('page', pageNumber);
        url.search = searchParams.toString();
        history.pushState(null, '', url);
        createCurrentLastTransaction(data, pageNumber);
      }
      if (pageNumber === '>>' && numOfPages !== nowPage) {
        const nextPage = nowPage + 1;
        searchParams.set('page', nextPage);
        url.search = searchParams.toString();
        history.pushState(null, '', url);
        createCurrentLastTransaction(data, nextPage);
      }
      if (pageNumber === '<<' && nowPage !== 1) {
        const prevPage = nowPage - 1;
        searchParams.set('page', prevPage);
        url.search = searchParams.toString();
        history.pushState(null, '', url);
        createCurrentLastTransaction(data, prevPage);
      }
      sessionStorage.setItem('page', searchParams.get('page'));
      sessionStorage.setItem('id', searchParams.get('id'));
      url.search = searchParams.toString();
      history.pushState(null, '', url);
    });
  });

  if (pagesBtnArr.length >= 7) {
    const nowPage = Number(searchParams.get('page'));
    switch (nowPage) {
      case 1:
      case 2:
      case 3:
        pagesBtnArr = [
          ...pagesBtnArr.slice(0, 4),
          el('li.page-item', el('a.page-link', '...')),
          ...pagesBtnArr.slice(-2),
        ];
        break;

      case numOfPages:
      case numOfPages - 1:
      case numOfPages - 2:
        pagesBtnArr = [
          ...pagesBtnArr.slice(0, 2),
          el('li.page-item', el('a.page-link', '...')),
          ...pagesBtnArr.slice(-4),
        ];
        break;
      case nowPage:
        pagesBtnArr = [
          ...pagesBtnArr.slice(0, 2),
          el('li.page-item', el('a.page-link', '...')),
          ...pagesBtnArr.slice(nowPage - 1, nowPage),
          ...pagesBtnArr.slice(nowPage, nowPage + 2),
          el('li.page-item', el('a.page-link', '...')),
          ...pagesBtnArr.slice(-2),
        ];
        break;
    }
  }
  return el(
    'nav',
    el('ul.pagination.account__pagination.pagination-lg', pagesBtnArr)
  );
}

export function createLastTransactions(data, firstIndex, lastIndex) {
  if (document.querySelector('.account__history-container')) {
    document.querySelector('.account__history-container').remove();
  }
  const balance = document.querySelector('.account__balance-value');
  balance.textContent = createCurrentMoneyFormat(data.balance);

  const allTransactions = [...data.transactions].reverse();

  const main = document.querySelector('.main__account');
  const lastTransactions = allTransactions.slice(firstIndex, lastIndex);

  const lastTransactionsDOM = [];
  lastTransactions.forEach((elem) => {
    const dateObj = new Date(elem.date);
    const day = dateObj.getUTCDate();
    const month = dateObj.getUTCMonth() + 1;
    const year = dateObj.getUTCFullYear();
    const formattedDate = `${day < 10 ? '0' + day : day}.${
      month < 10 ? '0' + month : month
    }.${year}`;

    const amountValue =
      data.account === elem.from ? `-${elem.amount}` : `${elem.amount}`;

    const amountColor =
      data.account === elem.from
        ? '.row-text__color-red'
        : '.row-text__color-green';
    const row = el(
      '.history__row',
      el('p.row-text.row-invoice', elem.from),
      el('p.row-text.row-invoice', elem.to),
      el(
        `p.row-text${amountColor}.row-amount`,
        createCurrentMoneyFormat(amountValue)
      ),
      el('p.row-text', formattedDate)
    );
    lastTransactionsDOM.push(row);
  });
  const historyContainer = el(
    '.account__history-container.cursor-pointer',
    el('h3.account__card-title#accountTitle', 'История переводов'),
    el(
      '.history__row-title',
      el('p.row-title__text.row-title__text1', 'Счет отправителя'),
      el('p.row-title__text.row-title__text2', 'Счет получателя'),
      el('p.row-title__text.row-title__text3', 'Сумма'),
      el('p.row-title__text.row-title__text4', 'Дата')
    ),
    lastTransactionsDOM
  );

  const pathname = window.location.pathname;
  if (
    pathname === '/accounts/account-details' &&
    data.transactions.length >= 25
  ) {
    const numOfPages = Math.ceil(data.transactions.length / 25);
    const pagination = createPagination(data, numOfPages);
    mount(historyContainer, pagination);
  }
  mount(main, historyContainer);
}

function removeTooltips() {
  document.querySelectorAll('[class^="my-tooltip"]').forEach((el) => {
    el.remove();
  });
}

export function createAccount(data) {
  createAutocompletionList();
  const header = createHeader('account');
  const id = data.account;

  const params = new URLSearchParams();
  params.set('id', id);
  const url = new URL('/accounts/account', window.location.origin);
  url.search = params.toString();
  history.pushState(null, '', url);

  document.body.style.overflow = 'auto';
  const main = el('main.main.main__account');

  const accountH1 = el(
    'h1.login__title.accounts__title-top',
    'История баланса'
  );
  const goBackBtn = el(
    'button.login__btn.account__btn-back',
    'Вернуться назад'
  );
  const sendBtn = el('button.login__btn.account__btn-send', 'Отправить');

  const accountH2 = el('h2.account__title', `№ ${data.account}`);
  const balanceValue = el(
    'p.account__balance-value',
    createCurrentMoneyFormat(data.balance)
  );

  const dropdownBtn = el('input.btn.dropdown-toggle.account__dropdown', {
    'data-bs-toggle': 'dropdown',
  });
  const dropdown = el(
    '.dropdown',
    dropdownBtn,
    el('ul.dropdown-menu.account__dropdown-menu', createAutocompletionList())
  );

  const newTransactionContsiner = el(
    '.new-transaction__container',
    el('h3.account__card-title', 'Новый перевод'),
    el(
      'form',
      el(
        '.input_container.account_input-container',
        el('label.account__label', 'Номер счёта получателя'),
        dropdown
      ),
      el(
        '.input_container.account_input-container.account__input-container-amount',
        el('label.account__label', 'Сумма перевода'),
        el('input.account__input.account__input-amount')
      ),
      sendBtn
    )
  );

  const balanceDynamicsContainer = el(
    '.balance-dynamics__container.cursor-pointer',
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
        el('canvas#myChar', { style: { height: '165px' } }),
        el('#myCharMonth')
      ),
      el('#myCharValue')
    )
  );

  setChildren(
    main,
    el('.account__title-row', accountH1, goBackBtn),
    el(
      '.account__title-row',
      accountH2,
      el('div', el('p.account__balance', 'Баланс'), balanceValue, {
        style: { display: 'flex' },
      })
    ),
    el(
      '#account__container-block',
      newTransactionContsiner,
      balanceDynamicsContainer
    )
  );
  setChildren(document.body, [header.header, main]);

  createLastTransactions(data, 0, 10);

  const handleClick = () => {
    window.location.pathname = 'accounts';
  };

  goBackBtn.addEventListener('click', handleClick);

  const dropdownBtnAccount = document.querySelector('.account__dropdown');
  const dropdownList = document.querySelector('.account__dropdown-menu');
  const dropdownItems = document.querySelectorAll('.account__dropdown-item');

  dropdownBtnAccount.addEventListener('input', function () {
    dropdownList.classList.add('show');
    dropdownItems.forEach((item) => {
      item.textContent.includes(this.value)
        ? item.classList.remove('hidden')
        : item.classList.add('hidden');
    });

    dropdownItems.length === document.querySelectorAll('.hidden').length
      ? dropdownList.classList.remove('show')
      : dropdownList.classList.add('show');
  });

  dropdownItems.forEach((item) => {
    item.addEventListener('click', function () {
      dropdownBtnAccount.value = item.textContent;
    });
  });

  sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    removeTooltips();

    const accountCont = document.querySelector('.dropdown');
    const amountCont = document.querySelector(
      '.account__input-container-amount'
    );
    const amountInput = document.querySelector('.account__input-amount');

    function showInputError(inputContainer, errorMessage) {
      createTooltip(inputContainer, errorMessage);

      document.querySelector('.my-tooltip').style.top = '10px';
      inputContainer
        .querySelector('input')
        .classList.add('login__input--wrong');
    }

    const myAccountValue = data.account;
    const transferAccountValue = dropdownBtn.value.replaceAll(' ', '');
    const transferAmountValue = document
      .querySelector('.account__input')
      .value.replaceAll(' ', '');

    if (transferAccountValue.length <= 25) {
      showInputError(accountCont, 'Не корректный номер счета');
      return;
    }
    if (transferAccountValue === '') {
      showInputError(accountCont, 'Поле не должно быть пустым');
      return;
    }
    if (transferAmountValue === '') {
      showInputError(amountCont, 'Поле не должно быть пустым');
      return;
    }
    if (myAccountValue === transferAccountValue) {
      showInputError(accountCont, 'Счет списания равен счету получателя');
      return;
    }

    if (transferAmountValue > data.balance) {
      showInputError(amountCont, 'Недостаточно средств на счете для перевода');
      return;
    }
    if (transferAmountValue <= 0) {
      showInputError(amountCont, 'Сумма перевода должна быть больше 0');
      return;
    }

    const dataForSend = {
      from: myAccountValue,
      to: transferAccountValue,
      amount: transferAmountValue,
    };
    postAutocompletionList(dataForSend.to);
    postTransferFunds(dataForSend, getToken());

    amountInput.style.borderColor = '#76CA66';
    mount(amountCont, el('.my-tooltip-succsess'));
    console.log(amountInput);
    setTimeout(() => {
      if (document.querySelector('.my-tooltip-succsess') !== null) {
        document
          .querySelector('.my-tooltip-succsess')
          .classList.add('my-tooltip-succsess--open');
        document.querySelector('.my-tooltip-succsess').style.top = '10px';
      }
    }, 100);
  });

  document
    .querySelector('.account__input')
    .addEventListener('input', function () {
      this.value = this.value.replace(/[^\d.]/g, '');
    });

  const data1 = getLastMonthData(data, 6);

  const dataValue = [];
  const dataMonthValueArr = [];
  data1.forEach((item) => {
    dataValue.push(Number(item.value));
    dataMonthValueArr.push(el('p', item.month.slice(0, 3)));
  });
  const maxDataValue = Math.max(...dataValue);

  setChildren(document.querySelector('#myCharValue'), [
    el('p', maxDataValue),
    el('p', 0),
  ]);
  setChildren(document.querySelector('#myCharMonth'), dataMonthValueArr);

  new Chart(document.getElementById('myChar'), {
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
            textStrokeColor: 'red',
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

  balanceDynamicsContainer.addEventListener('click', () => {
    goBackBtn.removeEventListener('click', handleClick);
    createAccountDetails(data);
  });
  document
    .querySelector('.account__history-container')
    .addEventListener('click', () => {
      goBackBtn.removeEventListener('click', handleClick);
      createAccountDetails(data);
    });
}
