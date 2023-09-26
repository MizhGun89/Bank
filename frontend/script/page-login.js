import { el, setChildren } from 'redom';
import createHeader from './header';
import { getlogin } from './main';
import { createTooltip } from './page-currency';

function showInputError(inputContainer, errorMessage) {
  createTooltip(inputContainer, errorMessage);

  document
    .querySelectorAll('.my-tooltip')
    .forEach((el) => (el.style.top = '10px'));
  document
    .querySelectorAll('.my-tooltip')
    .forEach((el) => (el.style.right = '98px'));
  inputContainer.querySelector('input').classList.add('login__input--wrong');
}

function removeTooltip() {
  document.querySelectorAll('.my-tooltip').forEach((el) => el.remove());
  document
    .querySelectorAll('input')
    .forEach((el) => el.classList.remove('login__input--wrong'));
}

function createSkeletonHeader() {
  return el('header.header.is-loading.is-loading__header');
}

function createSkeletonLogin() {
  return el('.main__login', el('.is-loading.is-loading__login'));
}

export default function createLoginPage(error) {
  if (error) {
    const loginCont = document.querySelector('.input_container-login');
    const passwordCont = document.querySelector('.input_container-password');
    removeTooltip();
    if (error === 'No such user') {
      showInputError(loginCont, 'Нет такого пользователя');
    }
    if (error === 'Invalid password') {
      showInputError(passwordCont, 'Неверный пароль');
    }
    return;
  }

  const url = new URL('/login', window.location.origin);
  history.pushState(null, '', url);
  document.body.innerHTML = '';
  const header = createHeader('login').header;

  const main = el('main.main__login');
  const container = el('.login__container');
  const h1 = el('h1.login__title', 'Вход в аккаунт');
  const form = el('form');
  const div1 = el('.input_container.input_container-login');
  const labelLogin = el('label', 'Логин');
  const inputLogin = el('input.login__input.login__input-login', {
    type: 'text',
    value: 'developer',
  });
  const div2 = el('.input_container.input_container-password');
  const labelPassword = el('label', 'Пароль');
  const inputPass = el('input.login__input.login__input-password', {
    type: 'text',
    value: 'skillbox',
  });
  const btnLogin = el('button.login__btn', 'Войти');

  setChildren(div1, [labelLogin, inputLogin]);
  setChildren(div2, [labelPassword, inputPass]);
  setChildren(form, [div1, div2, btnLogin]);
  setChildren(container, [h1, form]);
  setChildren(main, container);

  btnLogin.addEventListener('click', function (e) {
    e.preventDefault();
    removeTooltip();
    const loginValue = inputLogin.value.trim();
    const passwordValue = inputPass.value.trim();
    const loginCont = document.querySelector('.input_container-login');
    const passwordCont = document.querySelector('.input_container-password');

    if (passwordValue === '') {
      showInputError(passwordCont, 'Поле не должно быть пустым');
    }
    if (loginValue === '') {
      showInputError(loginCont, 'Поле не должно быть пустым');
    } else {
      getlogin(loginValue, passwordValue);
    }
  });

  setChildren(document.body, [createSkeletonHeader(), createSkeletonLogin()]);
  setTimeout(() => {
    setChildren(document.body, [header, main]);
  }, 1000);
}
