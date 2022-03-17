import { SEX, CASE_SOURCE } from "../common/enums";

export interface IPerson {
  /**
   * id 日期+号数
   */
  id?: string;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 名称
   */
  name?: string;

  /**
   * 性别
   */
  sex?: SEX;

  /**
   * 年龄
   */
  age?: number;

  /**
   * 地址
   */
  address?: string;

  /**
   * 来源
   */
  source?: CASE_SOURCE;

  /**
   * 位置信息
   */
  position?: IAMapPlace;
}

export interface IAMapPlace {
  /**
   * 示例："益田花园"
   */
  name?: string;

  /**
   * 示例："B0FFF2OHJL"
   */
  id?: string;

  /**
   * 示例："114.057373,22.5134"
   */
  location?: string;

  /**
   * 示例："商务住宅;住宅区;住宅小区"
   */
  type?: string;

  /**
   * 示例："120302"
   */
  typecode?: string;

  /**
   * 示例："广东省"
   */
  pname?: string;

  /**
   * 示例："深圳市"
   */
  cityname?: string;

  /**
   * 示例："福田区"
   */
  adname?: string;

  /**
   * 示例："益田南路1006号"
   */
  address?: string;

  /**
   * 示例："440000"
   */
  pcode?: string;

  /**
   * 示例："0755"
   */
  citycode?: string;

  /**
   * 示例："440304"
   */
  adcode?: string;
}
