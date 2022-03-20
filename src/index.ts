import fs from "fs";
import axios from "axios";
import { limitReq, saveFile, resolve, getPeerFileList } from "./common/utils";
import { IPerson, IAMapPlace } from "./models";
import { SEX, CASE_SOURCE } from "./common/enums";

const fileList = getPeerFileList("data/source/shenzhen/*.txt");
const positionCache = new Map();
fileList.forEach((file, i) => {
  // if (i > 0) {
  //   return;
  // }
  const date = file.match(/([^\/]+)\.txt/)![1];
  const text = fs.readFileSync(file, { encoding: "utf-8" });
  const rawList = text
    .trim()
    .split("\n")
    .filter((item) => !!item);

  let textList = [];
  for (let i = 0, l = Math.ceil(rawList.length / 2); i < l; i++) {
    const x1 = 2 * i;
    const x2 = 2 * i + 2;
    // 字符串合并，清除所有不可见字符
    textList.push(rawList.slice(x1, x2).join("，").replace(/\s/g, ""));
  }

  // 提取规则
  const rules: { [propName: string]: any } = {
    id: /病例(\d+)/,
    name: /(病例\d+)/,
    sex: /(男|女)/,
    age: /(\d+)岁/,
    address: /居住在([^，]+)/,
    source: /，(在[^，。]+)/,
  };

  // 提取信息
  const infoList: Array<any> = [];
  textList.forEach((text) => {
    const info: any = {};
    for (const k in rules) {
      const flag = text.match(rules[k]);
      if (Array.isArray(flag)) {
        info[k] = flag[1];
      }
    }
    infoList.push(info);
  });

  // 转换层
  const personList: Array<IPerson> = [];
  infoList.forEach((info) => {
    try {
      // 来源
      let source = CASE_SOURCE.intimate;
      if (info.source.includes("社区筛查")) {
        source = CASE_SOURCE.community;
      } else if (info.source.includes("重点区域")) {
        source = CASE_SOURCE.keyArea;
      }
      personList.push({
        id: `${date}--${info.id}`,
        createTime: date,
        name: info.name,
        sex: info.sex === "男" ? SEX.man : SEX.woman,
        age: Number.parseInt(info.age),
        address: info.address,
        source,
        position: undefined,
      });
    } catch (error) {
      console.error(error);
      console.log("info", info);
    }
  });

  // 通过高德地图API查询地理信息
  limitReq(
    personList,
    (current: IPerson, next: any) => {
      // ---TEST---
      // next(current);
      // return;
      // ---TEST---

      // 优先从缓存中取
      if (positionCache.has(current.address)) {
        current.position = positionCache.get(current.address);
        next(current);
      } else {
        const params: { [propName: string]: any } = {
          key: "59375d116f9c591b6c37b8a7c89c41e6",
          region: "深圳市",
          keywords: current.address,
        };
        const parameters = new URLSearchParams(params).toString();
        const url = "https://restapi.amap.com/v5/place/text?" + parameters;
        axios.get(url).then(({ data }) => {
          const { status, pois } = data;
          if (status === "1") {
            const detail = pois[0];
            positionCache.set(current.address, detail); // 缓存待用
            current.position = detail;
            next(current);
          }
        });
      }
    },
    (data: Array<IPerson>) => {
      saveFile(data, date);
    },
  );
});
