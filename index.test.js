const testUtils = require("./test-utils");
const index = require('./');

describe('tests', () => {
  it('createRequest should use right values', () => {
    const url = 'http://url.com/';

    const request = index.createRequest(url);

    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');
    const headers = request.headers;
    testHeaders(headers);
  });

  it('getDayTimesUrl should use right values', () => {
    const cityCode = 123;
    const date = '2023-11-27';

    expect(index.getDayTimesUrl(cityCode, date))
      .toBe(`https://ais.usvisa-info.com/${index.language}/niv/schedule/${index.sessionNumber}/appointment/times/${cityCode}.json?date=${date}&appointments[expedite]=false`);
  })

  it('fetchAvailableDateTimes should use right values', async () => {
    const cityCode = 123;
    const date = '2023-11-27';

    const response = await index.fetchAvailableDateTimes(cityCode, date);

    expect(testUtils.mocks.fetch.fetchMock).toBeCalledWith(
      expect.objectContaining({
        url: index.getDayTimesUrl(cityCode, date),
        method: `GET`
      }));

    testHeaders(testUtils.mocks.fetch.fetchMock.mock.lastCall[0].headers);
    expect(response).toEqual(["08:15"]);
  })

  function testHeaders(headers) {
    expect(headers.get('Accept')).toBe('application/json, text/javascript, */*; q=0.01');
    expect(headers.get('Accept-Encoding')).toBe('gzip, deflate, br');
    expect(headers.get('Accept-Language')).toBe('en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,pt-BR;q=0.6,pt;q=0.5,zh-CN;q=0.4,zh;q=0.3');
    expect(headers.get('Connection')).toBe('keep-alive');
    expect(headers.get('X-Requested-With')).toBe('XMLHttpRequest');
  }

})
