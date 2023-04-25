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
  const timeout = 5000;
  page.setDefaultTimeout(timeout);

  const flags = {
    screenEmulation: {
      disabled: true,
    },
  };
  const config = desktopConfig;
  const lhFlow = await startFlow(page, {
    name: "Recording 24/04/2023 at 13:28:28",
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
  await lhFlow.startNavigation();
  {
    const targetPage = page;
    const promises = [];
    promises.push(targetPage.waitForNavigation());
    await targetPage.goto("https://www.mtvuutiset.fi/");
    await Promise.all(promises);
  }
  await lhFlow.endNavigation();
  await lhFlow.startTimespan();
  {
    const targetPage = page;
    await scrollIntoViewIfNeeded(
      [
        ["aria/Hyväksyn"],
        ["#onetrust-accept-btn-handler"],
        ['xpath///*[@id="onetrust-accept-btn-handler"]'],
        ["pierce/#onetrust-accept-btn-handler"],
      ],
      targetPage,
      timeout
    );
    const element = await waitForSelectors(
      [
        ["aria/Hyväksyn"],
        ["#onetrust-accept-btn-handler"],
        ['xpath///*[@id="onetrust-accept-btn-handler"]'],
        ["pierce/#onetrust-accept-btn-handler"],
      ],
      targetPage,
      { timeout, visible: true }
    );
    await element.click({
      offset: {
        x: 71,
        y: 12.609375,
      },
    });
  }
  await lhFlow.endTimespan();
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
