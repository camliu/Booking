import { test, expect } from '@playwright/test';
import path from 'path';

const UI_URL = 'http://localhost:5173/';

test.beforeEach(async ({ page }) => {
  await page.goto(UI_URL);

  await page.getByRole('link', { name: 'Sign In' }).click();

  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

  await page.locator('[name=email]').fill('1@a.com');
  await page.locator('[name=password]').fill('123456');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Sign in Successful')).toBeVisible();
});

test('should allow user to add a hotel', async ({ page }) => {
  const hotelName = `Test Hotel ${Math.floor(Math.random() * 900) + 100}`;
  await page.goto(UI_URL);

  await page.goto(`${UI_URL}add-hotel`);

  await page.locator('[name="name"]').fill(hotelName);
  await page.locator('[name="city"]').fill('Test City');
  await page.locator('[name="country"]').fill('Test Country');
  await page.locator('[name="description"]').fill('Test Description');
  await page.locator('[name="pricePerNight"]').fill('1');
  await page.selectOption('select[name="starRating"]', '1');
  await page.getByText('Budget').click();
  await page.getByLabel('Free Wifi').check();
  await page.locator('[name="adultCount"]').fill('1');
  await page.locator('[name="childCount"]').fill('1');
  await page.setInputFiles('[name="imageFiles"]', [
    path.join(__dirname, 'files', 'hotel.jpg'),
  ]);

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Hotel Saved')).toBeVisible();
});

test('should display hotel', async ({ page }) => {
  await page.goto(`${UI_URL}my-hotels`);

  await expect(page.getByText('Test Hotel')).toBeVisible();
  await expect(page.getByText('Test Description')).toBeVisible();
  await expect(page.getByText('Test City')).toBeVisible();
  await expect(page.getByText('Test Country')).toBeVisible();
  await expect(page.getByText('Budget')).toBeVisible();
  await expect(page.getByText('€1 per night')).toBeVisible();
  await expect(page.getByText('1 adults, 1 children')).toBeVisible();
  await expect(page.getByText('1 Star Rating')).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'View Details' }).first()
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Add Hotel' })).toBeVisible();
});

test('should edit hotel', async ({ page }) => {
  await page.goto(`${UI_URL}my-hotels`);

  await page.getByRole('link', { name: 'View Details' }).first().click();

  await page.waitForSelector('[name="name"]', { state: 'attached' });
  await expect(page.locator('[name="name"]')).toHaveValue('Test Hotel');
  await page.locator('[name="name"]').fill('Test Hotel Updated');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Hotel Saved')).toBeVisible();

  await page.reload();

  await expect(page.locator('[name="name"]')).toHaveValue('Test Hotel Updated');

  await page.locator('[name="name"]').fill('Test Hotel');
  await page.getByRole('button', { name: 'Save' }).click();
});
