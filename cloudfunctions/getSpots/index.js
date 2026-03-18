// 云函数：getSpots
// 以管理员身份读取景点数据库，绕过前端权限限制
'use strict';

const tcb = require('@cloudbase/node-sdk');

// 内置兜底数据（当数据库集合为空时使用）
const FALLBACK_SPOTS = [
  {
    _id: 'spot_1',
    name: '北岳恒山',
    tag: '国家5A级景区',
    rate: '⭐ 5A景区',
    category: '自然',
    image: 'images/spot-mountain2.jpg',
    location: '浑源县城南 · 主峰海拔2016m · 五岳之一 · 道教圣地',
    tooltip: '🏔 海拔2016m · 五岳之北岳\n道教圣地 · 门票约80元\n建议游览时间：全天',
    isBig: true,
    sort: 1
  },
  {
    _id: 'spot_2',
    name: '悬空寺',
    tag: '全国重点文物',
    rate: '⭐ 全国重点',
    category: '人文',
    image: 'images/spot-temple.jpg',
    location: '恒山金龙峡 · 世界建筑奇迹',
    tooltip: '⛩ 北魏始建 · 距今1500年\n儒释道三教合一 · 门票约130元\n建议游览：2-3小时',
    isBig: false,
    sort: 2
  },
  {
    _id: 'spot_3',
    name: '永安寺',
    tag: '国家重点文物',
    rate: '⭐ 国宝壁画',
    category: '人文',
    image: 'images/spot-cliff.jpg',
    location: '浑源县城 · 元代古建',
    tooltip: '🎨 元代古建 · 国宝级壁画\n精美塑像与彩绘保存完好\n门票约30元',
    isBig: false,
    sort: 3
  },
  {
    _id: 'spot_4',
    name: '恒山林海',
    tag: '生态景区',
    rate: '',
    category: '自然',
    image: 'images/spot-forest.jpg',
    location: '天峰岭 · 四季皆美',
    tooltip: '🌲 四季皆宜 · 秋季最美\n野生植物1000余种\n徒步首选 · 免费开放',
    isBig: false,
    sort: 4
  },
  {
    _id: 'spot_5',
    name: '浑源古城墙',
    tag: '历史古迹',
    rate: '',
    category: '人文',
    image: 'images/spot-wall.jpg',
    location: '浑源县城 · 明代遗址',
    tooltip: '🏯 明代遗址 · 历史遗存\n古城格局保存较好\n文化步行 · 免费参观',
    isBig: false,
    sort: 5
  }
];

exports.main = async (event, context) => {
  const app = tcb.init({ env: tcb.SYMBOL_CURRENT_ENV });
  const db = app.database();

  try {
    // 读取 spots 集合，按 sort 字段排序，最多取 20 条
    const res = await db.collection('spots')
      .orderBy('sort', 'asc')
      .limit(20)
      .get();

    const spots = res.data || [];

    // 如果集合为空，返回内置兜底数据
    if (spots.length === 0) {
      return {
        code: 0,
        message: 'fallback',
        data: FALLBACK_SPOTS,
        source: 'fallback'
      };
    }

    return {
      code: 0,
      message: 'ok',
      data: spots,
      source: 'database'
    };

  } catch (err) {
    console.error('[getSpots] 数据库查询失败:', err);
    // 出错时也返回兜底数据，保证前端正常显示
    return {
      code: 0,
      message: 'fallback_on_error',
      data: FALLBACK_SPOTS,
      source: 'fallback'
    };
  }
};
