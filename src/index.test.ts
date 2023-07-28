const tests = require("./mocks");
const index = require('.');

describe('tests', () => {
  beforeEach(() => {
    tests.mocks.audio.playMock.mockClear();
    tests.mocks.time.setTimeoutMock.mockClear();
    tests.mocks.fetch.fetchMock.mockClear();
    tests.mocks.fetch.jsonMock().mockClear();
  })

  it('sleep should be called with right args', async () => {
    const expectedSleepTime = 100;

    await index.sleep(expectedSleepTime);

    const mockLastCall = tests.mocks.time.setTimeoutMock.mock.lastCall;
    expect(mockLastCall[0]).toEqual(expect.any(Function))
    const actualSleepTime = mockLastCall[1]
    expect(expectedSleepTime).toBe(actualSleepTime)
  })

  it('createRequest should use right values', () => {
    const url = 'http://url.com/';

    const request = index.createRequest(url);

    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');
    const headers = request.headers;
    testHeaders(headers);
  });

  it('getDayTimesUrl should use right values', () => {
    const cityCode = 55;
    const date = '2023-02-15';

    expect(index.getDayTimesUrl(cityCode, date))
      .toBe(`https://ais.usvisa-info.com/${index.language}/niv/schedule/${index.sessionNumber}/appointment/times/${cityCode}.json?date=${date}&appointments[expedite]=false`);
  })

  it('getDatesUrl should use right values', () => {
    const cityCode = 55;

    expect(index.getDatesUrl(cityCode))
      .toBe(`https://ais.usvisa-info.com/${index.language}/niv/schedule/${index.sessionNumber}/appointment/days/${cityCode}.json?appointments[expedite]=false`);
  })

  it('fetchAvailableDateTimes should use right values', async () => {
    const cityCode = 55;
    const date = '2023-02-15';

    const response = await index.fetchAvailableDateTimes(cityCode, date);

    expect(tests.mocks.fetch.fetchMock).toBeCalledWith(
      expect.objectContaining({
        url: index.getDayTimesUrl(cityCode, date),
        method: `GET`
      }));

    testHeaders(tests.mocks.fetch.fetchMock.mock.lastCall[0].headers);
    expect(response).toEqual(["08:15"]);
  })

  it('fetchAvailableDates should use right values', async () => {
    const cityCode = 55;

    const response = await index.fetchAvailableDates(cityCode);

    expect(tests.mocks.fetch.fetchMock).toBeCalledWith(
      expect.objectContaining({
        url: index.getDatesUrl(cityCode),
        method: `GET`
      }));

    testHeaders(tests.mocks.fetch.fetchMock.mock.lastCall[0].headers);
    expect(response).toEqual([{
      business_day: true,
      date: "2023-01-01"
    },
    {
      business_day: true,
      date: "2023-02-11"
    }]);
  })

  it('checkDateTimes should use right values and call audio', async () => {
    const cityCode = 55;
    const day = { date: '2023-02-15' }

    const response = await index.checkDateTimes(cityCode, day);

    expect(response).toBeTruthy();
    expect(tests.mocks.fetch.fetchMock).toBeCalledWith(
      expect.objectContaining({
        url: index.getDayTimesUrl(cityCode, day.date)
      }));

    expect(tests.mocks.audio.playMock).toHaveBeenCalled()
  })

  it('checkDateTimes with no available time should not call audio', async () => {
    const cityCode = 100;
    const day = { date: '2023-02-15' }

    const response = await index.checkDateTimes(cityCode, day);

    expect(response).toBeFalsy();
    expect(tests.mocks.fetch.fetchMock).toBeCalledWith(
      expect.objectContaining({
        url: index.getDayTimesUrl(cityCode, day.date)
      }));

    expect(tests.mocks.audio.playMock).not.toHaveBeenCalled()
  })

  it('search should call sleep at the end of its execution', () => {
    index.search([])

    expect(tests.mocks.time.setTimeoutMock).toHaveBeenCalledWith(expect.any(Function), expect.any(Number))
    const sleepTime = tests.mocks.time.setTimeoutMock.mock.lastCall[1]

    const minWaitTime = index.minIntervalBetweenFetchesInMinutes * 1000 * 60;
    expect(sleepTime).toBeGreaterThan(minWaitTime)
  })

  function testHeaders(headers) {
    expect(headers.get('Accept')).toBe('application/json, text/javascript, */*; q=0.01');
    expect(headers.get('Accept-Encoding')).toBe('gzip, deflate, br');
    expect(headers.get('Accept-Language')).toBe('en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,pt-BR;q=0.6,pt;q=0.5,zh-CN;q=0.4,zh;q=0.3');
    expect(headers.get('Connection')).toBe('keep-alive');
    expect(headers.get('X-Requested-With')).toBe('XMLHttpRequest');
  }

})
