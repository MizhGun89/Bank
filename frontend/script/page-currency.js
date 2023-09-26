/* eslint-disable no-unused-vars */
import { el, setChildren, mount } from 'redom';
import createHeader from './header';
import { getToken } from './tokenStore';
import accounting from 'accounting';
import { postCurrencyBuy, getRealTimeCourseRate } from './main';
import bootstrapBundleMin from 'bootstrap/dist/js/bootstrap.bundle.min';

function createCurrentMoneyFormat(num) {
  return accounting.formatMoney(num, '', 2, ' ', '.');
}

function createSkeletonHeader() {
  return el('header.header.is-loading.is-loading__header');
}
function createSkeletonTitle() {
  return el(
    '.main.is-loading__title',
    el('.is-loading', {
      style: { width: '250px', height: '40px' },
    })
  );
}
function createSkeletonCurrency() {
  return el(
    '.main.currency__main',
    el(
      'div',
      el('.is-loading.is-loading__currency-title', {
        style: { width: '250px', height: '40px' },
      }),
      el(
        '.main__container',
        el(
          '.currency__container-card.your-currencies.is-loading.is-loading__currency'
        ),
        el('.currency__container-card.real-time-cours__container.is-loading')
      )
    )
  );
}

function createRealTimeCourseRate(socket, container) {
  const rows = [];
  const div = el('div', {
    style: 'display: flex; flex-direction: column; width: 100%;',
  });
  const realTimeCoursContainer = el(
    '.currency__container-card.real-time-cours__container',
    el('h2.currency__your-curr', 'Изменение курсов в реальном времени')
  );
  mount(realTimeCoursContainer, div);
  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const pair = `${data.from}/${data.to}`;
    const rate = data.rate;
    const change = data.change;
    const changeColor = change === 1 ? '.dot--green' : '.dot--red';
    const changeArrow = change === 1 ? '.arrow-up' : '.arrow-down';

    const row = el('.currency__row');
    const currCode = el('p.currency__name', pair);
    const dot = el(`.dot.${changeColor}`);
    const currValue = el(`p.currency__value${changeArrow}`, rate);

    setChildren(row, [currCode, dot, currValue]);

    rows.push(row);

    if (rows.length >= 22) {
      rows.shift();
    }
  };
  setInterval(() => {
    div.innerHTML = '';
    rows.forEach((row) => {
      mount(div, row);
    });
  }, 1000);
  setTimeout(() => {
    mount(container, realTimeCoursContainer);
  }, 0);
}

export function createTooltip(container, text) {
  const tooltip = el('.my-tooltip', {
    'data-bs-toggle': 'tooltip',
    'data-bs-title': `${text}`,
    'data-bs-custom-class': 'custom-tooltip',
  });
  mount(container, tooltip);
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrapBundleMin.Tooltip(tooltipTriggerEl)
  );
}

export function removeTooltip() {
  document.querySelectorAll('[class^="my-tooltip"]').forEach((el) => {
    el.remove();
  });
}

function inputValidation(data) {
  removeTooltip();
  const input = document.querySelector('input');
  const cont = document.querySelector('.sum__row');
  switch (data.error) {
    case 'Overdraft prevented':
      input.classList.add('login__input--wrong');
      createTooltip(
        cont,
        'Вы не можете перевести больше, чем доступно на счёте списания'
      );
      break;
    case 'Not enough currency':
      input.classList.add('login__input--wrong');
      createTooltip(cont, 'На валютном счёте списания нет средств');
      break;
    case 'Invalid amount':
      input.classList.add('login__input--wrong');
      createTooltip(cont, 'Не указана сумма перевода, или она отрицательная');
      break;
    default:
      input.style.borderColor = '#76CA66';
      mount(cont, el('.my-tooltip-succsess'));
      setTimeout(() => {
        if (document.querySelector('.my-tooltip-succsess') !== null) {
          document
            .querySelector('.my-tooltip-succsess')
            .classList.add('my-tooltip-succsess--open');
        }
      }, 100);
      break;
  }
}

function createYourCurrenciesBox(data) {
  const cont1 = el('.currency__container-card.your-currencies');
  const cont1Title = el('h2.currency__your-curr', 'Ваши валюты');
  setChildren(cont1, cont1Title);

  Object.keys(data).forEach((curr) => {
    const row = el('.currency__row.row__your-currencies');
    const currCode = el('p.currency__name', curr);
    const dot = el('.dot');
    const currValue = el(
      'p.currency__value',
      createCurrentMoneyFormat(data[curr].amount)
    );
    if (data[curr].amount.toFixed(2) !== '0.00') {
      setChildren(row, [currCode, dot, currValue]);
      mount(cont1, row);
    }
  });
  return cont1;
}

export function updateYourCurrenciesBox(data) {
  inputValidation(data);
  const currentData = data.payload;
  if (currentData !== null) {
    const cont1 = document.querySelector('.your-currencies');
    document
      .querySelectorAll('.row__your-currencies')
      .forEach((row) => row.remove());
    const rows = [];
    Object.keys(currentData).forEach((curr) => {
      const row = el('.currency__row.row__your-currencies');
      const currCode = el('p.currency__name', curr);
      const dot = el('.dot');
      const currValue = el(
        'p.currency__value',
        createCurrentMoneyFormat(currentData[curr].amount)
      );
      if (currentData[curr].amount.toFixed(2) !== '0.00') {
        setChildren(row, [currCode, dot, currValue]);
        rows.push(row);
      }
    });
    rows.forEach((row) => mount(cont1, row));
  }
}

export function createCurrencyPage(data) {
  document.body.style.overflow = 'auto';

  const url = new URL('/currency', window.location.origin);
  history.pushState(null, '', url);
  const currData = data.payload;

  const token = getToken();
  const header = createHeader('currency');
  const main = el('main.main.currency__main');
  const currencyTitle = el('h1.login__title', 'Валютный обмен');
  const mainContainer = el('.main__container');

  const selectOption1 = [];
  const selectOption2 = [];

  Object.keys(currData).forEach((curr) => {
    el('li', el('a.dropdown-item', curr));
    selectOption1.push(el('li', el('a.dropdown-item', curr)));
    selectOption2.push(el('li', el('a.dropdown-item', curr)));
  });

  const cont1 = createYourCurrenciesBox(currData);

  const dropdownMenu1 = el(
    'ul.dropdown-menu.currency__dropdown-menu',
    selectOption1
  );
  const dropdownMenu2 = el(
    'ul.dropdown-menu.currency__dropdown-menu',
    selectOption2
  );

  const cont2 = el('.currency__container-card');
  const cont2Title = el('h2.currency__your-curr', 'Обмен валюты');

  const exchangeRow1 = el('.exchange__row');
  const dropdownBtn1 = el('button.btn.dropdown-toggle.dropdown__btn', 'RUB', {
    'data-bs-toggle': 'dropdown',
    type: 'button',
  });

  const dropdownBtn2 = el('button.btn.dropdown-toggle.dropdown__btn', 'CAD', {
    'data-bs-toggle': 'dropdown',
    type: 'button',
  });

  const exchangeRow2 = el('.exchange__row.sum__row');
  setChildren(
    exchangeRow2,
    el('p.exchange__par', 'Сумма'),
    el('input.login__input.exchange__input ')
  );
  const div = el('.fdfdfd');
  const rowCont = el('div.exchange__row-cont');
  const exchangeBtn = el('button.login__btn.exchange__btn', 'Обменять');

  setChildren(exchangeRow1, [
    el('p.exchange__par', 'Из'),
    el('.btn-broup', [dropdownBtn1, dropdownMenu1]),
    el('p.exchange__par', 'в'),
    el('.btn-broup', [dropdownBtn2, dropdownMenu2]),
  ]);
  dropdownBtn1.addEventListener('click', () => {
    dropdownMenu1.classList.toggle('dropdown--open');
    dropdownBtn1.classList.toggle('dropdown--open-btn');
  });
  dropdownBtn2.addEventListener('click', () => {
    dropdownMenu2.classList.toggle('dropdown--open');
    dropdownBtn2.classList.toggle('dropdown--open-btn');
  });
  document.body.addEventListener('click', (e) => {
    if (e.target === dropdownBtn1 || dropdownMenu1.contains(e.target)) {
      return;
    }
    if (e.target === dropdownBtn2 || dropdownMenu2.contains(e.target)) {
      return;
    }
    dropdownMenu1.classList.remove('dropdown--open');
    dropdownBtn1.classList.remove('dropdown--open-btn');
    dropdownMenu2.classList.remove('dropdown--open');
    dropdownBtn2.classList.remove('dropdown--open-btn');
  });

  selectOption1.forEach((item) => {
    item.addEventListener('click', function () {
      dropdownBtn1.textContent = item.children[0].innerHTML;
      dropdownMenu1.classList.remove('dropdown--open');
      dropdownBtn1.classList.remove('dropdown--open');
    });
  });
  selectOption2.forEach((item) => {
    item.addEventListener('click', function () {
      dropdownBtn2.textContent = item.children[0].innerHTML;
      dropdownMenu2.classList.remove('dropdown--open');
      dropdownBtn2.classList.remove('dropdown--open');
    });
  });
  const socket = getRealTimeCourseRate();
  createRealTimeCourseRate(socket, mainContainer);

  setChildren(rowCont, [exchangeRow1, exchangeRow2]);
  setChildren(div, [rowCont, exchangeBtn]);
  setChildren(cont2, [cont2Title, div]);
  setChildren(mainContainer, el('div', [cont1, cont2]));
  setChildren(main, [currencyTitle, mainContainer]);

  setChildren(document.body, [
    createSkeletonHeader(),
    createSkeletonCurrency(),
  ]);

  setTimeout(() => {
    setChildren(document.body, [header.header, main]);
    const exchangeInput = document.querySelector('.exchange__input');
    exchangeInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^\d.]/g, '');
    });
    exchangeBtn.addEventListener('click', () => {
      removeTooltip();
      exchangeInput.classList.remove('login__input--wrong');
      if (exchangeInput.value.trim() !== '') {
        const valuesForExchange = {
          from: dropdownBtn1.innerHTML,
          to: dropdownBtn2.innerHTML,
          amount: exchangeInput.value,
        };
        postCurrencyBuy(valuesForExchange, token);
      } else {
        exchangeInput.classList.add('login__input--wrong');
        createTooltip(exchangeRow2, 'Поле не должно быть пустым');
      }
    });
  }, 1000);
}
