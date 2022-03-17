import fs from "fs";
import path from "path";
import async from "async";
import glob from "glob";

export default {
  saveFile,
  limitReq,
  resolve,
  getPeerFileList,
};

/**
 * 写文件
 */
export function saveFile(data: any, name: string) {
  const dataJSON = JSON.stringify(data, null, 2);
  const baseUrl = path.resolve(__dirname, "../../../", "output");
  const filename = path.resolve(baseUrl, `${name}.json`);
  console.log("baseUrl", baseUrl);
  console.log(filename);
  // 检查输出文件夹是否存在
  if (!fs.existsSync(baseUrl)) {
    // 不存在则先创建
    fs.mkdirSync(baseUrl);
  }
  // 写入文件
  fs.writeFile(filename, dataJSON, "utf-8", (err) => {
    if (err) {
      console.log("error! 文件保存失败");
      throw err;
    }
    console.log("success! 文件保存成功，传送门：" + filename);
  });
}

/**
 * 并发控制
 */
export function limitReq(list: any[], next: any, success: any) {
  async.mapLimit(
    list,
    5, // 限制并发次数
    // 每一次请求触发
    (current, resolve) => {
      // 并发5次，后续逐个进行
      const random: string = ((Math.random() * 10000000) % 2000).toString();
      const delay: number = Number.parseInt(random, 10); // 延时时间
      console.log(`当前并发 5，正在抓取，间隔时间 ${delay} 毫秒`);
      setTimeout(() => {
        next(current, (payload: any) => {
          resolve(null, payload);
        });
      }, delay);
    },
    // 获取最终结果时触发
    (err, result) => {
      success(result);
    },
  );
}

/**
 * 以根目录为起点，获取绝对路径
 */
export function resolve(filename = ".") {
  // filename === "/" 时路径将为磁盘根路径
  return path.resolve(__dirname, "../../../", filename);
}

/**
 * 获取同类型文件列表
 */
export function getPeerFileList(rule: string) {
  // 示例："public/static/dll/*.json"
  return glob.sync(resolve(rule));
}
