/* eslint-disable n/handle-callback-err */
/* eslint-disable no-undef */
/// <reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

describe('Приложение запускается', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });
  it('Приложение НЕ запускается при НЕ корректном логине', () => {
    cy.get('input:first').clear().type('Alex');
    cy.get('input:last').clear().type('skillbox');
    cy.get('button').click();
    cy.url().should('include', 'login');
  });
  it('Приложение НЕ запускается при НЕ корректном пароле', () => {
    cy.get('input:first').clear().type('developer');
    cy.get('input:last').clear().type('0000000');
    cy.get('button').click();
    cy.url().should('include', 'login');
  });
  it('Приложение запускается при корректном логине/пароле', () => {
    cy.get('input:first').clear().type('developer');
    cy.get('input:last').clear().type('skillbox');
    cy.get('button').click();
    // cy.wait(1500);
    cy.url().should('include', 'accounts');
    cy.get('h1').should('contain', 'Ваши счета');
  });
});
describe('Проверка счетов', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
    cy.get('input:first').clear().type('developer');
    cy.get('input:last').clear().type('skillbox');
    cy.get('button').click();
    cy.wait(1000);
  });

  it('Счета отображаются', () => {
    cy.get('.accounts__title').should('contain', '74213041477477406320783754');
  });
});
describe('Все страницы открываются корректно', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
    cy.get('input:first').clear().type('developer');
    cy.get('input:last').clear().type('skillbox');
    cy.get('button').click();
    cy.wait(1000);
  });

  it('Страница "Ваши счета"', () => {
    cy.url().should('include', 'accounts');
    cy.get('h1').should('contain', 'Ваши счета');
  });
  it('Страница "История баланса"', () => {
    cy.get('button:contains("Открыть"):first').click();
    cy.url().should('include', '74213041477477406320783754');
    cy.get('h1').should('contain', 'История баланса');
  });
  it('Страница "История баланса детальная"', () => {
    cy.get('button:contains("Открыть"):first').click();
    cy.get('.account__history-container').click();
    cy.url().should('include', 'account-details');
    cy.get('h1').should('contain', 'История баланса');
  });
  it('Страница "Банкоматы"', () => {
    cy.get('button:contains("Банкоматы")').click();
    cy.url().should('include', 'atms');
    cy.get('h1').should('contain', 'Банкоматы');
  });
  it('Страница "Валюта"', () => {
    cy.get('button:contains("Валюта")').click();
    cy.url().should('include', 'currency');
    cy.get('h1').should('contain', 'Валютный обмен');
  });
  it('Страница "Логина"', () => {
    cy.get('button:contains("Выйти")').click();
    cy.url().should('include', 'login');
  });
});

describe('Перевод со счета на счет работает корректно', () => {
  const number = 139;
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
    cy.get('input:first').clear().type('developer');
    cy.get('input:last').clear().type('skillbox');
    cy.get('button').click();
    cy.wait(1000);
  });
  it('Перевод на счет 38486471062310270476523504 работает корректно', () => {
    cy.get('button:contains("Открыть"):first').click();
    cy.get('input:first').clear().type('38486471062310270476523504');
    cy.get('input:last').clear().type(number);
    cy.get('button:contains("Отправить")').click();
  });
  it('Перевод на счет 38486471062310270476523504 дошел до адресата', () => {
    cy.get('button:contains("Открыть")').eq(1).click();
    cy.get('.row-amount:first').should('contain', number);
  });
  it('Перевод на счет 74213041477477406320783754 работает корректно и отображается в истории переводов', () => {
    cy.get('button:contains("Открыть")').eq(1).click();
    const number1 = 101;
    cy.get('input:first').clear().type('74213041477477406320783754');
    cy.get('input:last').clear().type(number1);
    cy.get('button:contains("Отправить")').click();
    cy.get('.row-amount:first').should('contain', number1);
  });
  it('Валидация: Пустое поле счета выдаст ошибку при отправке', () => {
    cy.get('button:contains("Открыть")').eq(1).click();
    cy.get('button:contains("Отправить")').click();
    cy.get('.dropdown')
      .find('.my-tooltip[data-bs-title="Поле не должно быть пустым"]')
      .should('exist');
  });
  it('Валидация: Пустое поле суммы перевода выдаст ошибку при отправке', () => {
    cy.get('button:contains("Открыть")').eq(1).click();
    cy.get('input:first').clear().type('74213041477477406320783754');
    cy.get('input:last').clear();
    cy.get('button:contains("Отправить")').click();
    cy.get('.account__input-container-amount')
      .find('.my-tooltip[data-bs-title="Поле не должно быть пустым"]')
      .should('exist');
  });
  it('Валидация: Счет списания = счету получателя', () => {
    cy.get('button:contains("Открыть"):first').click();
    cy.get('input:first').clear().type('74213041477477406320783754');
    cy.get('input:last').clear().type(number);
    cy.get('button:contains("Отправить")').click();
    cy.get('.dropdown')
      .find('.my-tooltip[data-bs-title="Счет списания равен счету получателя"]')
      .should('exist');
  });
});
