import { el, setChildren } from 'redom';
import createLoginPage from './page-login';
import { getToken } from './tokenStore';
import { getAccaunts, getСurrencies, getBanks } from './main';

export default function createHeader(page = 'login') {
  const header = el('header.header');
  const headerContainer = el('.header__container');
  const headerLogo = el('p.header__logo', 'Coin.');

  const btnContainer = el('.header__btn-container');
  const btnATMs = el('button.header__btn#btnATMs', 'Банкоматы');
  const btnAccount = el('button.header__btn#btnAccount', 'Счета');
  const btnCurrency = el('button.header__btn#btnCurrency', 'Валюта');
  const btnLogout = el('button.header__btn#btnLogout', 'Выйти');
  const btnArr = [btnATMs, btnAccount, btnCurrency];
  btnArr.forEach((btn) => {
    btn.classList.remove('header__btn--selected');
  });

  if (page === 'login') {
    setChildren(headerContainer, headerLogo);
  }
  if (page === 'accounts') {
    setChildren(btnContainer, [
      headerLogo,
      btnATMs,
      btnAccount,
      btnCurrency,
      btnLogout,
    ]);
    setChildren(headerContainer, [headerLogo, btnContainer]);
    btnAccount.classList.add('header__btn--selected');
  }
  if (page === 'account') {
    setChildren(btnContainer, [
      headerLogo,
      btnATMs,
      btnAccount,
      btnCurrency,
      btnLogout,
    ]);
    setChildren(headerContainer, [headerLogo, btnContainer]);
  }
  if (page === 'atms') {
    setChildren(btnContainer, [
      headerLogo,
      btnATMs,
      btnAccount,
      btnCurrency,
      btnLogout,
    ]);
    setChildren(headerContainer, [headerLogo, btnContainer]);
    btnATMs.classList.add('header__btn--selected');
  }
  if (page === 'currency') {
    setChildren(btnContainer, [
      headerLogo,
      btnATMs,
      btnAccount,
      btnCurrency,
      btnLogout,
    ]);
    setChildren(headerContainer, [headerLogo, btnContainer]);
    btnCurrency.classList.add('header__btn--selected');
  }

  setChildren(header, headerContainer);

  btnLogout.addEventListener('click', function (e) {
    e.preventDefault();
    const login = createLoginPage();
    setChildren(document.body, [login.header, login.main]);
  });
  btnATMs.addEventListener('click', function (e) {
    e.preventDefault();
    getBanks(getToken());
  });
  btnAccount.addEventListener('click', function (e) {
    e.preventDefault();
    const token = getToken();
    getAccaunts(token);
  });
  btnCurrency.addEventListener('click', function (e) {
    e.preventDefault();
    const token = getToken();
    getСurrencies(token);
  });

  return { header, btnLogout, btnATMs };
}
