import puppeteer from 'puppeteer';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => {
    return new Promise((resolve) => rl.question(query, resolve));
};

const mainFunc = async (username, password, isRandom) => {
    // const browser = await puppeteer.launch({browser: 'firefox', headless: false});
    const browser = await puppeteer.launch({browser: 'firefox', headless: true});
    const page = await browser.newPage();

    await page.goto('https://cis.del.ac.id');

    await page.setViewport({width: 1920, height: 1080});

    const inputUsername = await page.locator('#loginform-username')
    const inputPassword = await page.locator('#loginform-password')
    const loginButton = await page.waitForSelector('::-p-xpath(/html/body/div/div/form/div[2]/div[2]/button)')


    let selection = 0

    if (isRandom.toLowerCase() === 'n') {
        console.log('Sangat Setuju (0)')
        console.log('Setuju (1)')
        console.log('Cukup Setuju (2)')
        console.log('Tidak Setuju (3)')
        selection = prompt('Choose number of your option to be select : ')
    }

    await inputUsername.fill(username)
    await inputPassword.fill(password)
    await loginButton.click();

    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    await page.waitForSelector('a');

    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a"))
            .map(link => link.href)
            .filter(href => href.includes("/srvy/kuesioner/vote-kuesioner"));
    });

    await page.goto(links[0]);

    await page.waitForSelector('form table tr');

    const rows = await page.$$("form table tr");

    for (const [rowIndex, row] of rows.entries()) {
        const inputs = await row.$$("label");

        if (inputs.length > 0) {
            if (isRandom === 'y') {
                const randomIndex = Math.floor(Math.random() * inputs.length);
                await inputs[randomIndex].click();
            }

            if (isRandom === 'n') {
                await inputs[selection].click();
            }
        }
    }

    const submitButton = await page.waitForSelector('::-p-xpath(/html/body/div/div[1]/section[2]/div[2]/div/div/div/form/div/div/div/div/div/input)')
    await submitButton.click();

    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    await browser.close()
};

const username = await askQuestion('Masukkan username : ')
const password = await askQuestion('Masukkan password : ')
const isRandom = await askQuestion('Is Random (y/n) : ')
let isDone = false;

for (let i = 0; i < 20; i++) {
    if (!isDone) {
        try {
            await mainFunc(username, password, isRandom);
            console.log(`Kuisioner ${i + 1} selesai.`)
        } catch (e) {
            console.log('Proses selesai.')
            isDone = true;
        }
    } else {
        break;
    }
}

rl.close();
