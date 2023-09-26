/* eslint-disable indent */
/* eslint-disable array-callback-return */
import { el, setChildren } from 'redom';
import accounting from 'accounting';
import createHeader from './header';
import { getToken } from './tokenStore';
import { getAccaunt, postCreateAccount } from './main';

function createSkeletonHeader() {
  return el('header.header.is-loading.is-loading__header');
}
function createSkeletonTitle() {
  return el(
    '.main.is-loading__title',
    { style: { 'margin-bottom': '61px' } },
    el('.is-loading', {
      style: { width: '250px', height: '40px' },
    })
  );
}
function createSkeletonAccounts() {
  const arr = [];
  const title = el(
    '.main.pt-0',
    {
      style: { 'padding-left': '38px', 'padding-right': '60px' },
    },
    el('.is-loading', {
      style: { width: '250px', height: '40px' },
    })
  );
  for (let i = 0; i <= 8; i++) {
    const accountContainer = el(
      '.accounts__container.justify-content-between.align-items-end'
    );
    const container = el('.d-flex.flex-column.justify-content-between');
    const accountTitle = el('.is-loading', {
      style: { width: '250px', height: '50px', 'margin-bottom': '12px' },
    });
    const lastTransaction = el('.is-loading', {
      style: { width: '180px', height: '50px' },
    });

    const btn = el('.is-loading__btn', {
      style: { width: '110px', height: '52px' },
    });
    setChildren(container, [accountTitle, lastTransaction]);
    setChildren(accountContainer, [container, btn]);
    arr.push(accountContainer);
  }
  setChildren(title, el('.justify-content-between.d-flex.flex-wrap', arr));
  return title;
}

function createCurrentMoneyFormat(num) {
  return accounting.formatMoney(num, '₽', 2, ' ', '.', '%v %s');
}

function createCurrentDate(str) {
  const date = new Date(str);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('ru-RU', options);
  return formattedDate;
}

function createCardAccounts(data) {
  const accountArr = [];
  data.forEach((elem) => {
    const accountContainer = el('.accounts__container');
    const container = el('.cont');
    const accountTitle = el('h2.accounts__title', elem.account);
    const accountBalance = el(
      'p.accounts__balance',
      createCurrentMoneyFormat(elem.balance)
    );
    const lastTransaction = el(
      'p.accounts__last-transaction',
      'Последняя транзакция: '
    );
    const lastTransactionValue =
      elem.transactions[0]?.date.length > 0
        ? el(
            'p.accounts__last-transaction-value',
            createCurrentDate(elem.transactions[0].date)
          )
        : '';
    const btn = el('button.login__btn.accounts__btn', 'Открыть');

    setChildren(container, [
      accountTitle,
      accountBalance,
      lastTransaction,
      lastTransactionValue,
    ]);

    btn.addEventListener('click', () => {
      getAccaunt(getToken(), elem.account);
    });

    setChildren(accountContainer, [container, btn]);
    accountArr.push(accountContainer);
  });
  return accountArr;
}

function sortCardAccounts(data, sortBy) {
  const dataArr = [...data];

  dataArr.sort((a, b) => {
    if (sortBy === 'transactions[0].date') {
      const dateA =
        a.transactions[0] !== undefined ? new Date(a.transactions[0].date) : 0;
      const dateB =
        b.transactions[0] !== undefined ? new Date(b.transactions[0].date) : 0;
      if (dateA < dateB) {
        return 1;
      } else if (dateA > dateB) {
        return -1;
      } else if (dateA === dateB) {
        return 0;
      }
    } else {
      if (!a) return -1;
      if (!b) return -1;
      if (a[sortBy] < b[sortBy]) {
        return 1;
      } else if (a[sortBy] > b[sortBy]) {
        return -1;
      } else if (a[sortBy] === b[sortBy]) {
        return 0;
      }
    }
  });
  return dataArr;
}

export default function createAccounts(data) {
  const url = new URL('/accounts', window.location.origin);
  history.pushState(null, '', url);
  document.body.style.overflow = 'auto';
  document.body.innerHTML = '';
  const header = createHeader('accounts');

  const dropdownBtn = el(
    'button.btn.dropdown-toggle.accounts__dropdown',
    {
      'data-bs-toggle': 'dropdown',
    },
    'Сортировка'
  );
  const dropdown = el(
    '.dropdown',
    dropdownBtn,
    el(
      'ul.dropdown-menu.accounts__dropdown-menu',
      el('li', el('a.dropdown-item.accounts__dropdown-item', 'По номеру')),
      el('li', el('a.dropdown-item.accounts__dropdown-item', 'По балансу')),
      el(
        'li',
        el('a.dropdown-item.accounts__dropdown-item', 'По последней транзакции')
      )
    )
  );

  const createNewAccountBtn = el(
    'button.account_create-account.login__btn',
    'Создать новый счет'
  );

  const title = el(
    '.accounts__title-row',
    el(
      'div',
      { style: { display: 'flex' } },
      el('h1.login__title.accounts__h1', 'Ваши счета'),
      dropdown
    ),
    createNewAccountBtn
  );

  const main = el('main.main');

  setChildren(main, [
    title,
    el('div#card-update', createCardAccounts(data), {
      style: {
        display: 'flex',
        'flex-wrap': 'wrap',
      },
    }),
  ]);

  createNewAccountBtn.addEventListener('click', () => {
    postCreateAccount(getToken());
  });

  setChildren(document.body, [
    createSkeletonHeader(),
    createSkeletonTitle(),
    createSkeletonAccounts(),
  ]);

  setTimeout(() => {
    setChildren(document.body, [header.header, main]);
    const dropdownItemSort = document.querySelectorAll(
      '.accounts__dropdown-item'
    );
    dropdownItemSort.forEach((el) => {
      el.addEventListener('click', function () {
        dropdownItemSort.forEach(
          (elem) =>
            (elem.onclick = elem.classList.remove(
              'accounts__dropdown-item--checked'
            ))
        );
        this.classList.add('accounts__dropdown-item--checked');
        const cardsContainer = document.querySelector('#card-update');
        let sortData;
        if (this.innerHTML === 'По балансу') {
          sortData = sortCardAccounts(data, 'balance');
        }
        if (this.innerHTML === 'По номеру') {
          sortData = sortCardAccounts(data, 'account');
        }
        if (this.innerHTML === 'По последней транзакции') {
          sortData = sortCardAccounts(data, 'transactions[0].date');
        }
        cardsContainer.innerHTML = '';
        setChildren(cardsContainer, createCardAccounts(sortData));
      });
    });
    const dropdownBtnAccounts = document.querySelector('.accounts__dropdown');
    dropdownBtnAccounts.addEventListener('click', function () {
      this.classList.toggle('dropdown--open-btn');
    });
    document.body.addEventListener('click', (e) => {
      if (
        e.target === dropdownBtnAccounts ||
        dropdownBtnAccounts.contains(e.target)
      ) {
        return;
      }
      dropdownBtnAccounts.classList.remove('dropdown--open-btn');
    });
  }, 1000);
}
