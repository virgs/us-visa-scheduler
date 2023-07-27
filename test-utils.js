
const mocks = {
  audio: {
    pauseMock: jest.fn(),
    playMock: jest.fn(() => Promise.resolve())
  },
  fetch: {
    jsonMock: (request) => jest.fn(() => {
      const beforeMinDate = { "date": "2023-01-01", "business_day": true }
      const inRangeDate = { "date": "2023-02-11", "business_day": true }
      const afterMaxDate = { "date": "2023-03-11", "business_day": true }
      if (request.url === "https://ais.usvisa-info.com/pt-br/niv/schedule/38681568/appointment/days/55.json?appointments[expedite]=false") {
        return ([beforeMinDate, inRangeDate])
      } else if (request.url === "https://ais.usvisa-info.com/pt-br/niv/schedule/38681568/appointment/days/56.json?appointments[expedite]=false") {
        return ([beforeMinDate, afterMaxDate])
      } else {
        if (request.url === "https://ais.usvisa-info.com/pt-br/niv/schedule/38681568/appointment/times/123.json?date=2023-11-27&appointments[expedite]=false") {
          return { available_times: ["08:15"], business_times: ["08:15", "08:30", "09:15"] }
        } else {
          console.error("Test scenario not anticipated")
        }
      }
    }),
    fetchMock: jest.fn(async (request) => ({
      json: mocks.fetch.jsonMock(request)
    }))
  }
}

const testUtils = {
  Audio: jest.fn().mockImplementation(() => ({
    pause: mocks.audio.pauseMock,
    play: mocks.audio.playMock,
  })),
  fetch: mocks.fetch.fetchMock,
  setTimeout: jest.fn(async (promise, sleepTime) => promise())
}

module.exports = {
  testUtils,
  mocks
}