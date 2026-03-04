export const dom = {
  // top bar
  logout: document.querySelector('[data-testid="btn-logout"]'),
  userEmail: document.querySelector('[data-testid="user-email"]'),

  // login screen inputs
  emailInput: document.querySelector('[data-testid="login-email"]'),
  passInput: document.querySelector('[data-testid="login-password"]'),

  // register screen inputs
  regEmailInput: document.querySelector('[data-testid="register-email"]'),
  regPassInput: document.querySelector('[data-testid="register-password"]'),
  regPassInput2: document.querySelector('[data-testid="register-password2"]'),
  registerFormBtn: document.querySelector('[data-testid="btn-register-form"]'),

  // buttons
  loginBtn: document.querySelector('[data-testid="btn-login"]'),
  registerBtn: document.querySelector('[data-testid="btn-register"]'),
  registerBackBtn: document.querySelector('[data-testid="btn-register-back"]'),
  bikeBtn: document.querySelectorAll('.bikeCard__main'),
  backToGarageBtn: document.querySelector('[data-testid="btn-back-to-garage"]'),
  deleteBikeBtn: document.querySelectorAll('.iconbtn--danger'),
  editBikeBtn: document.querySelectorAll('.iconbtn--edit'),
  addBikeBtn: document.querySelector('[data-testid="btn-add-bike"]'),

  // screens
  nav: document.querySelector('[data-testid="topbar"]'),
  loginScreen: document.querySelector('[data-testid="screen-login"]'),
  registerScreen: document.querySelector('[data-testid="screen-register"]'),
  garageScreen: document.querySelector('[data-testid="screen-garage"]'),
  bikeScreen: document.querySelector('[data-testid="screen-bike"]'),
  addBikeScreen: document.querySelector('[data-testid="screen-bike-add"]'),
  editBikeScreen: document.querySelector('[data-testid="screen-bike-edit"]'),

  // bikes grid
  bikeGrid: document.querySelector('[data-testid="garage-grid"]'),
  noBikesYetGrid: document.querySelector('[data-testid="garage-empty"]'),

  // add bike form
  addBikeForm: document.querySelector('[data-testid="add-bike-form"]'),
  make: document.querySelector('#addBikeName'),
  model: document.querySelector('#addBikeModel'),
  year: document.querySelector('#addBikeYear'),
  odo: document.querySelector('#addBikeOdo'),

  // edit bike form
  editBikeForm: document.querySelector('[data-testid="edit-bike-form"]'),
  editBikeId: document.querySelector<HTMLInputElement>('#editBikeId'),
  editMake: document.querySelector<HTMLInputElement>('#editBikeName'),
  editYear: document.querySelector<HTMLInputElement>('#editBikeYear'),
  editModel: document.querySelector<HTMLInputElement>('#editBikeModel'),
  editOdo: document.querySelector<HTMLInputElement>('#editBikeOdo'),
};
