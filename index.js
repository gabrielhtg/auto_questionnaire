import puppeteer from 'puppeteer';

const mainFunc = async () => {
    // const browser = await puppeteer.launch({browser: 'firefox', headless: false});
    const browser = await puppeteer.launch({browser: 'firefox', headless: true});
    const page = await browser.newPage();

    await page.goto('https://cis.del.ac.id');

    await page.setViewport({width: 1920, height: 1080});

    const inputUsername = await page.locator('#loginform-username')
    const inputPassword = await page.locator('#loginform-password')
    const loginButton = await page.waitForSelector('::-p-xpath(/html/body/div/div/form/div[2]/div[2]/button)')

    await inputUsername.fill('your username')
    await inputPassword.fill('your password')
    await loginButton.click();

    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    await page.waitForSelector('a');

    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a"))
            .map(link => link.href)
            .filter(href => href.includes("/srvy/kuesioner/vote-kuesioner")); // Filter link yang sesuai pola
    });

    await page.goto(links[0]);

    await page.waitForSelector('form table tr');

    const rows = await page.$$("form table tr");

    for (const [rowIndex, row] of rows.entries()) {
        const inputs = await row.$$("label");

        if (inputs.length > 0) {
            const randomIndex = Math.floor(Math.random() * inputs.length);
            await inputs[randomIndex].click(); // Klik dengan Puppeteer
        }
    }

    const submitButton = await page.waitForSelector('::-p-xpath(/html/body/div/div[1]/section[2]/div[2]/div/div/div/form/div/div/div/div/div/input)')
    await submitButton.click();

    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    await browser.close()
};

for (let i = 0; i < 20; i++) {
    try {
        await mainFunc();
    } catch (e) {
        console.log('Proses selesai.')
    }
}