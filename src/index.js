import fs from "fs";
import puppeteer from "puppeteer";
import open from "open";
import { desktopConfig, startFlow } from "lighthouse";
import {
  scrollIntoViewIfNeeded,
  waitForSelectors,
  reportPath,
} from "./helpers.js";

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  const timeout = 10000;
  page.setDefaultTimeout(timeout);

  const flags = {
    screenEmulation: {
      disabled: true,
    },
  };
  const config = desktopConfig;
  const lhFlow = await startFlow(page, {
    name: "MTVUutiset.fi recording",
    config,
    flags,
  });
  {
    const targetPage = page;
    await targetPage.setViewport({
      width: 1472,
      height: 1304,
    });
  }

  /********************************************
   * Open MTVUutiset.fi
   ********************************************/
  await lhFlow.startNavigation({ name: "Navigate to MTVUutiset.fi" });
  {
    const targetPage = page;
    const promises = [];
    promises.push(targetPage.waitForNavigation());
    await targetPage.goto("https://www.mtvuutiset.fi/");
    await Promise.all(promises);
  }
  await lhFlow.endNavigation();

  /********************************************
   * Accept Consent
   ********************************************/
  await lhFlow.startTimespan({ name: "Accept consent" });
  const consentSelectors = [
    ["aria/Hyväksyn"],
    ["#onetrust-accept-btn-handler"],
    ['xpath///*[@id="onetrust-accept-btn-handler"]'],
    ["pierce/#onetrust-accept-btn-handler"],
  ];
  {
    const targetPage = page;
    await scrollIntoViewIfNeeded(consentSelectors, targetPage, timeout);
    const element = await waitForSelectors(consentSelectors, targetPage, {
      timeout,
      visible: true,
    });
    await element.click({
      offset: {
        x: 88.5,
        y: 31.609375,
      },
    });
  }
  await lhFlow.endTimespan();

  /********************************************
   * Navigate to weather page
   ********************************************/
  await lhFlow.startNavigation({ name: "Navigate to weather page" });
  const weatherPageSelectors = [
    ["span.weather-temp"],
    ['xpath///*[@id="weather-data"]/div/div/span[1]'],
    ["pierce/span.weather-temp"],
  ];
  {
    const targetPage = page;
    const promises = [];
    promises.push(targetPage.waitForNavigation());
    await scrollIntoViewIfNeeded(weatherPageSelectors, targetPage, timeout);
    const element = await waitForSelectors(weatherPageSelectors, targetPage, {
      timeout,
      visible: true,
    });
    await element.click({
      offset: {
        x: 8.5,
        y: 16.5,
      },
    });
    await Promise.all(promises);
  }
  await lhFlow.endNavigation();

  /********************************************
   * Navigate to LIVE page
   ********************************************/
  const livePageSelectors = [
    ["aria/LIVE"],
    ["#navigation-live"],
    ['xpath///*[@id="navigation-live"]'],
    ["pierce/#navigation-live"],
  ];
  await lhFlow.startNavigation({ name: "Navigate to LIVE page" });
  {
    const targetPage = page;
    const promises = [];
    promises.push(targetPage.waitForNavigation());
    await scrollIntoViewIfNeeded(livePageSelectors, targetPage, timeout);
    const element = await waitForSelectors(livePageSelectors, targetPage, {
      timeout,
      visible: true,
    });
    await element.click({
      offset: {
        y: 11.5,
        x: 28.5,
      },
    });
    await Promise.all(promises);
  }
  await lhFlow.endNavigation();

  const lhFlowReport = await lhFlow.generateReport();
  const filename = "flow.report.html";
  const filePath = `${reportPath}/${filename}`;
  fs.writeFileSync(filePath, lhFlowReport);
  await browser.close();
  open(filePath, { wait: false });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
