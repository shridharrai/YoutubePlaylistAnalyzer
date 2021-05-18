//title
//total videos
//actual total videos
//views
//view watch time

const puppeteer = require('puppeteer');

let page;
let cvideos = 0;
async function youTube() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    let pages = await browser.pages();
    page = pages[0];
    await page.goto(
      'https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq'
    );
    await page.waitForSelector(
      '#stats>.style-scope.ytd-playlist-sidebar-primary-info-renderer',
      { visible: true }
    );
    await page.waitForSelector('h1#title', { visible: true });
    let { noOfVideos, noOfViews, title } = await page.evaluate(function() {
      let allElements = document.querySelectorAll(
        '#stats>.style-scope.ytd-playlist-sidebar-primary-info-renderer'
      );
      let noOfVideos = allElements[0].innerText;
      let noOfViews = allElements[1].innerText;
      let title = document.querySelector('h1#title').innerText;
      return { noOfVideos, noOfViews, title };
    });
    console.log(
      'Videos ' + noOfVideos + ' Views ' + noOfViews + ' Title ' + title
    );
    noOfVideos = noOfVideos.split(' ')[0];
    noOfVideos = Number(noOfVideos);

    while (noOfVideos - cvideos > 100) {
      await scrollDown();
    }
    await waitTillHTMLRendered(page);
    await scrollDown();
    console.log(cvideos);

    let videoSelector = '#video-title';
    let duration =
      'span.style-scope.ytd-thumbnail-overlay-time-status-renderer';
    let titleDurArr = await page.evaluate(
      getTitleDuration,
      videoSelector,
      duration
    );
    console.table(titleDurArr);
  } catch (error) {
    console.log(error);
  }
}

function getTitleDuration(videoSelector, duration) {
  let titleEleArr = document.querySelectorAll(videoSelector);
  let durationEleArr = document.querySelectorAll(duration);

  let titleDurArr = [];
  for (let i = 0; i < durationEleArr.length; ++i) {
    let title = titleEleArr[i].innerText;
    let duration = durationEleArr[i].innerText;
    titleDurArr.push({ title, duration });
  }
  return titleDurArr;
}

async function scrollDown() {
  let length = await page.evaluate(function() {
    let titleElements = document.querySelectorAll('#video-title');
    titleElements[titleElements.length - 1].scrollIntoView(true);
    return titleElements.length;
  });
  cvideos = length;
}

//  html wait
async function waitTillHTMLRendered(page, timeout = 30000) {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while (checkCounts++ <= maxChecks) {
    let html = await page.content();
    let currentHTMLSize = html.length;

    let bodyHTMLSize = await page.evaluate(
      () => document.body.innerHTML.length
    );

    console.log(
      'last: ',
      lastHTMLSize,
      ' <> curr: ',
      currentHTMLSize,
      ' body html size: ',
      bodyHTMLSize
    );

    if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
      countStableSizeIterations++;
    else countStableSizeIterations = 0; //reset the counter

    if (countStableSizeIterations >= minStableSizeIterations) {
      console.log('Page rendered fully..');
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }
}

youTube();
