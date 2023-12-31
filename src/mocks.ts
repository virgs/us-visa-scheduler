
const mocks = {
  audio: {
    pauseMock: jest.fn(),
    playMock: jest.fn(() => Promise.resolve())
  },
  fetch: {
    jsonMock: (request) => jest.fn(() => jsonMockImplementation(request)),
    fetchMock: jest.fn(async (request) => ({
      json: mocks.fetch.jsonMock(request)
    }))
  },
  time: {
    setTimeoutMock: jest.fn(async (promise, sleepTime) => promise())
  }
}

const jsonMockImplementation = (request) => {
  const beforeMinDate = { "date": "2023-01-01", "business_day": true }
  const inRangeDate = { "date": "2023-02-11", "business_day": true }
  const afterMaxDate = { "date": "2023-03-11", "business_day": true }
  if (request.url === "https://ais.usvisa-info.com/pt-br/niv/schedule/38681568/appointment/days/55.json?appointments[expedite]=false") {
    return [beforeMinDate, inRangeDate]
  } else if (request.url === "https://ais.usvisa-info.com/pt-br/niv/schedule/38681568/appointment/days/56.json?appointments[expedite]=false") {
    return [beforeMinDate, afterMaxDate]
  } else {
    if (request.url === "https://ais.usvisa-info.com/pt-br/niv/schedule/38681568/appointment/times/55.json?date=2023-02-15&appointments[expedite]=false") {
      return { available_times: ["08:15"], business_times: ["08:15", "08:30", "09:15"] }
    } if (request.url === "https://ais.usvisa-info.com/pt-br/niv/schedule/38681568/appointment/times/100.json?date=2023-02-15&appointments[expedite]=false") {
      return { available_times: [], business_times: ["08:15", "08:30", "09:15"] }
    } else {
      console.error("Test scenario not anticipated: " + request.url);
      return { available_times: ["08:15"], business_times: ["08:15", "08:30", "09:15"] }
    }
  }
  return []
}

const testUtils = {
  audio: jest.fn().mockImplementation(() => ({
    pause: mocks.audio.pauseMock,
    play: mocks.audio.playMock,
  })),
  fetch: mocks.fetch.fetchMock,
  setTimeout: mocks.time.setTimeoutMock
}

module.exports = {
  testUtils,
  mocks
}