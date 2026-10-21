import { type Locator, type Page } from '@playwright/test';


export class AuthPage {
    readonly loginForm: Locator;
    readonly loginEmail: Locator;
    readonly loginPassword: Locator;
    readonly loginSubmit: Locator;
    readonly loginError: Locator;
    readonly registerLink: Locator;



constructor(private readonly page: Page) {
    this.loginForm = page.getByTestId('login-form')
    this.loginEmail = page.getByTestId('login-email');
    this.loginPassword = page.getByTestId('login-password');
    this.loginSubmit = page.getByTestId('login-submit');
    this.loginError = page.getByTestId('login-error');
    this.registerLink = page.getByTestId('register-link');
}

async goto() {
  await this.page.goto('/login');
  await this.loginEmail.waitFor();
  await this.loginPassword.waitFor();

}

async login(email: string,password: string) {
    await this.loginEmail.fill(email);
   await this.loginPassword.fill(password);
   await  this.loginSubmit.click;
}
}