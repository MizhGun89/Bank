import createLoginPage from './page-login';
import createAccounts from './page-accounts';
import { createAccount, createLastTransactions } from './page-account';
import { createCurrencyPage, updateYourCurrenciesBox } from './page-currency';
import createAtmsPage from './page-atms';
import { createAccountDetails } from './page-account-details';
import { setToken, getToken } from './tokenStore';
import '../../node_modules/bootstrap/dist/js/bootstrap.bundle.min';

import '../assets/fonts/fonts.css';
import '../css/bootstrap.min.css';
import '../css/normalize.css';
import '../css/style.css';
import '../css/accounts.css';
import '../css/account.css';
import '../css/currencies.css';
import '../css/skeleton.css';

let token = null;

export async function getlogin(log, pass) {
  const user = {
    login: log,
    password: pass,
  };
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  if (data.payload === null) {
    createLoginPage(data.error);
  } else {
    token = data.payload.token;
    setToken(token);
    getAccaunts(token);
  }
}

export async function getAccaunts(token) {
  const response = await fetch('http://localhost:3000/accounts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  const data = await response.json();
  createAccounts(data.payload);
}

export async function getAccaunt(token, id) {
  const response = await fetch(`http://localhost:3000/account/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  const data = await response.json();
  createAccount(data.payload);
  return data.payload;
}

export async function getСurrencies(token) {
  const response = await fetch('http://localhost:3000/currencies', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  const data = await response.json();
  createCurrencyPage(data);
}

export async function postCurrencyBuy(exchangeValues, token) {
  const response = await fetch('http://localhost:3000/currency-buy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify(exchangeValues),
  });
  const data = await response.json();
  updateYourCurrenciesBox(data);
}

export function getRealTimeCourseRate() {
  return new WebSocket('ws://localhost:3000/currency-feed');
}

export async function postCreateAccount(token) {
  await fetch('http://localhost:3000/create-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  getAccaunts(token);
}

export async function postTransferFunds(sendData, token) {
  const response = await fetch('http://localhost:3000/transfer-funds', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify(sendData),
  });
  const data = await response.json();
  createLastTransactions(data.payload, 0, 10);
}

export async function getBanks(token) {
  const response = await fetch('http://localhost:3000/banks', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${token}`,
    },
  });
  const data = await response.json();
  createAtmsPage(data.payload);
}

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(document.location.search);
  const accountId = params.get('id');
  const routes = {
    '/': () => {
      createLoginPage();
    },
    '/login': () => {
      createLoginPage();
    },
    '/accounts': () => getAccaunts(getToken()),
    '/atms': () => getBanks(getToken()),
    '/currency': () => getСurrencies(getToken()),
    '/accounts/account': () => {
      getAccaunt(getToken(), accountId);
    },
    '/accounts/account-details': () => {
      const data = getAccaunt(getToken(), accountId);
      data.then((res) => createAccountDetails(res));
    },
  };

  function navigateTo(path) {
    const routeHandler = routes[path];
    if (routeHandler) {
      routeHandler();
    }
  }

  window.addEventListener('popstate', () => {
    navigateTo(window.location.pathname);
  });
  navigateTo(window.location.pathname);
});
