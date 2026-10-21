import { type Locator, type Page } from '@playwright/test';

export class RegisterPage{
    readonly registerForm: Locator;
    readonly registerName: Locator;
    readonly registerEmail: Locator;
    readonly registerPassword: Locator;
    readonly registerConfirmPassword: Locator;
    readonly registerSubmit: Locator;
    readonly registerError: Locator;
    readonly loginLink: Locator;
    readonly registerNameError: Locator;
    readonly registerEmailError: Locator;
    readonly registerPasswordError: Locator;
    readonly registerConfirmPasswordError: Locator;


    constructor(private readonly page: Page) {
    this.registerForm = page.getByTestId('register-form');
    this.registerName= page.getByTestId('register-name');
    this.registerEmail= page.getByTestId('register-email');
    this.registerPassword = page.getByTestId('register-password');
    this.registerConfirmPassword = page.getByTestId('register-confirm-password');
    this.registerSubmit = page.getByTestId('register-submit');
    this.registerError = page.getByTestId('register-error');
    this.loginLink = page.getByTestId('login-link');
    this.registerNameError = page.getByTestId('register-name-error');
    this.registerPasswordError = page.getByTestId('register-password-error');
    this.registerEmailError = page.getByTestId('register-email-error');
    this.registerConfirmPasswordError = page.getByTestId('register-confirmPassword-error');
    }

    async goto() {
        await this.page.goto('/register');
        await this.registerEmail.waitFor();
        await this.registerPassword.waitFor();
    }

    async register(password: string,name:string, email:string) {
       await this.registerName.fill(name);
      await  this.registerEmail.fill(email);
       await this.registerPassword.fill(password);
       await this.registerSubmit.click();
    }

    



}