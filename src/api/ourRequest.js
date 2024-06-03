import request from '@/utils/ourServicesRequest'


// 绘制网格线
export function drawGridOnMap (params) {
  return request({
    url: 'api/grid/drawGridOnMap',
    method: 'get',
    params: {
      geoLevel: params.level,
      lbLng: params.bounds[0],
      lbLat: params.bounds[1],
      rtLng: params.bounds[2],
      rtLat: params.bounds[3]
    }
  })
}

export function getLineGeoInfo (codingList) {
  return request({
    url: 'api/railway/getLineGeoInfo',
    method: 'get',
    params: {
      codingList:codingList
    }
  })
}

export function setRailGeo (coding) {
  return request({
    url: 'api/railway/setRailGeo',
    method: 'get',
    params: {
      coding:coding
    }
  })
}

export function getAllRoute () {
  return request({
    url: 'api/railway/getAllRoute',
    method: 'get',
    params: {}
  })
}

export function getAllChild (parentCoding) {
  return request({
    url: 'api/railway/getAllChild',
    method: 'get',
    params: {
      parentCoding:parentCoding
    }
  })
}

export function test () {
  return request({
    url: 'api/test/test',
    method: 'get',
    params: {}
  })
}
