// 重新设计state
/**
 * 之前的state设计不太好，查找的时候不方便
 *  {
    id: '1',
    title: 'first post',
    body: '*should be aware of this*',
    createdAt: 1563762965704
  },
  {
    id: '2',
    title: 'second post',
    body: '## this is the title',
    createdAt: 1563762965704
  },
  比较好的是map结构，方便查找
  '2': {
    id: '2',
    title: 'second post',
    body: '## this is the title',
    createdAt: 1563762965704
  },
 */

export const flattenArr = (arr) => {
    return arr.reduce((map, item) => {
        map[item.id] = item
        return map 
    }, {})
}

export const objToArr = (obj) => {
    return Object.keys(obj).map(key => obj[key])
}