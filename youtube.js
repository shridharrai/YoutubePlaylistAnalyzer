//title
//total videos
//actual total videos
//views
//view watch time

const puppeteer = require('puppeteer');

async function youTube() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    let pages = await browser.pages();
    let page = pages[0];
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

    let videoSelector = '#video-title';
    let duration =
      'span.style-scope.ytd-thumbnail-overlay-time-status-renderer';
    await page.waitForSelector(videoSelector, { visible: true });
    await page.waitForSelector(duration, { visible: true });
    await page.evaluate(getTitleDuration, videoSelector, duration);
  } catch (error) {
    console.log(error);
  }
}

function getTitleDuration(videoSelector, duration) {
  let titleEleArr = document.querySelectorAll(videoSelector);
  let durationEleArr = document.querySelectorAll(duration);

  let titleDurArr = {};
  for (let i = 0; i < durationEleArr.length; ++i) {
    let title = titleEleArr[i].innerText;
    let duration = durationEleArr[i].innerText;
    titleDurArr.push({ title, duration });
  }
  return titleDurArr;
}

youTube();
