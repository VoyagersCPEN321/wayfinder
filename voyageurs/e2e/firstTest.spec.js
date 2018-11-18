const { reloadApp } = require('detox-expo-helpers');
//const {app} = require('../App.js');

describe('Example', () => {
  beforeEach(async () => {
    await reloadApp();
  });

  it('facebook login button', async () => {
    console.log(element(by.id('loginButton')));
    // await expect(element(by.id('loginButton'))).toExist();// .toBeVisible();
  });

  // it('should show hello screen after tap', async () => {
  //   await element(by.id('hello_button')).tap();
  //   await expect(element(by.label('Hello!!!'))).toBeVisible();
  // });

  // it('should show world screen after tap', async () => {
  //   await element(by.id('world_button')).tap();
  //   await expect(element(by.label('World!!!'))).toBeVisible();
  // });
});