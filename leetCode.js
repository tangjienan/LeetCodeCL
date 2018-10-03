require('dotenv').config()
const puppeteer      = require('puppeteer')
const loginURL       = "https://leetcode.com/accounts/login/"
const problemMainURL = "https://leetcode.com/problemset/algorithms/"
const myListURL      = "https://leetcode.com/list/"

const sleep = time => new Promise(resolve => {
    setTimeout(resolve,time)
})

// log in to FB
var loginFB = async function(page) {
    // login
    console.log("fb")
    const fb   = await page.waitForSelector('a[data-icon=facebook]')
    console.log("hey")
    await page.waitFor(4000)
    const t = await page.$('a[data-icon=facebook]')
    await page.screenshot({path: 'click.png'});
    await fb.click()
    //await page.waitForNavigation()
    await page.waitForSelector('input[name=email]')
    const emailField = await page.$('input[name=email]')
    await emailField.click()
    await emailField.type(process.env.FB_EMAIL)
    await emailField.dispose()
    const passwordField = await page.$('input[name=pass]')
    await passwordField.click()
    await passwordField.type(process.env.FB_PASSWORD)
    await passwordField.dispose()
    const loginButton = await page.$('button[name=login]')
    await loginButton.focus()
    await loginButton.click()
    await loginButton.dispose()
    //wait for redirect to leetcodes
    await page.waitForNavigation()
}

// random number generator helper
// https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function randomSelect(questions, difficulty) {
    var selected = questions[difficulty]
    let index = Math.floor(getRandomArbitrary(0, selected.length - 1))
    
    console.log(selected[index])
    //console.log(selected)
    console.log(index)
}

function getLevelFromInput(argv) {
    let level = argv.l
    console.log(level)
    if (level === 'h') {
        return "Hard"
    }
    else if (level === 'm') {
        return "Medium"
    }
    else if (level == 'e') {
        return "Easy"
    }
}


async function parseProblem(page, level, questions) {
    await page.goto(problemMainURL);
    // click top showmore button
    const showMoreTags = await page.$('#expand-topic .text')
    await showMoreTags.click()
    await showMoreTags.dispose()
    // get all the tags
    const tags = await page.$$('#topic-module .tags a')
    //console.log(tags[0])
    for (tag of tags) {
        const tagLabel = await page.evaluate(el => el.innerText, tag);
        //console.log(tagLabel)
    }
    // show all problem
    await page.waitFor('select[class="form-control"]')
    await page.select('select[class="form-control"]', '9007199254740991');
    
    // loop through all the problem
    //problem = {}
    const problemList = await page.$$('.reactable-data tr') //elementHandle
    for (problemNode of problemList) {
        //problemNode = problemList[2]
        const problem = await page.evaluateHandle( (e) =>{
            return e.children
        },problemNode) //jsHandle
        const result = await page.evaluate(e => {
            return e[2].querySelector('div a').getAttribute("href")
        }, problem)
        const difficulty = await page.evaluate(e => {
            return e[5].querySelector('span').innerText
        }, problem)
        questions[difficulty].push({
            title : result,
            difficulty : difficulty
        })
    }
    randomSelect(questions,level)
}

async function getList(page) {
    await page.goto(myListURL);
    
}

async function leetcode(argv) {

    var Medium  = []
    var Easy    = []
    var Hard    = [] 

    var questions = {
        Medium : Medium,
        Easy  : Easy,
        Hard   : Hard
    }

    // get level
    let level = getLevelFromInput(argv)
    console.log("Level " + "   " + level)

    const browser = await puppeteer.launch({
        headless : false
    });
    const page = await browser.newPage();
    await page.goto(loginURL);
    // choose fb login
    await loginFB(page)
    await parseProblem(page,level,questions)
    //await getList(page)
    
}





module.exports = {
    leetcode: leetcode
}