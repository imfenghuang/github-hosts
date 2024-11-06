import { URL_LIST, FETCH_URL } from "./const.js";

const sleep = (wait = 500) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, wait);
  });
};

async function asyncPool(limit, array, fn) {
  const ret = [];
  const executing = [];

  for (const item of array) {
    const p = Promise.resolve().then(() => fn(item, array));
    ret.push(p);
    if (limit <= array.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

export const getIpAddress = async () => {
  let ipAddress = {};

  const fn = async (url) => {
    const headers = new Headers();
    headers.append("Content-Type", "text/plain");
    const raw = '{"domain":"' + url + '"}';
    const options = {
      method: "POST",
      headers,
      body: raw,
      redirect: "follow",
    };
    fetch(FETCH_URL, options)
      .then((response) => response.json())
      .then((result) => {
        console.log(
          `\n\n${url} query result:\n\n`,
          typeof result === "object" ? JSON.stringify(result) : result
        );
        if (
          Array.isArray(result?.a?.response?.answer) &&
          result?.a?.response?.answer?.length
        ) {
          ipAddress[url] = [];
          result.a.response.answer
            .filter((answer) => answer?.record?.recordType === "A")
            .forEach((answer) => {
              const { ipv4 } = answer.record;
              ipAddress[url].push(`${ipv4} ${url}`);
            });
        }
      })
      .catch((error) => {
        console.log(`\n\n${url} query error:\n\n`);
        console.error(error);
      });

    await sleep(2000);
  };

  await asyncPool(2, URL_LIST, fn);
  return ipAddress;
};

export const makeHosts = (updateTime, ipAddress) => {
  return `#Github HOSTS Start
#Update Time: ${updateTime}
${ipAddress}

#Github HOSTS End`;
};
