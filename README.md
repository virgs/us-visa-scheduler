# us-visa-scheduler

### What it does

It doesn't schedule, but it notifies (plays a song) you when a good candidate date is available.

#### Tutorial

1. Copy and paste the content of [this file](./src/index.js) in any text editor.
2. Make sure there's still an available audio [here](https://cdn.freesound.org/previews/533/533869_5828667-lq.mp3). If it's not the case, find one and replace the value of the variable `audioSource`.
3. Go to the **us-visa** web page and hit `Reschedule appointment`.
4. Keep this tab open all the time.
5. With your browser `Network` tab open (one of the tabs you'll see when you hit F12), select the city you want to schedule an appointment and get a `cityCode`, and the `sessionNumber` values. You can find them in `Headers -> General -> Request URL`. For example, in this **url** `https://ais.usvisa-info.com/en-ca/niv/schedule/41884788/appointment/days/95.json?appointments[expedite]=false`, the `cityCode` would be **95** and the `sessionNumber` **41884788**.
6. In the text editor:
   1. Set the value of the variable `cityCodes` with the new value.
      - Use , as separator. Eg. `const cityCodes = [55, 56]` or `const cityCodes = [55]` or `const cityCodes = [55, 56, 54]`
   2. Set the value of the variable `sessionNumber` with the new value.
   3. Set the value of the variable `maxFormattedDate` with the value you wish.
   4. Set the value of the variable `minFormattedDate` with the value you wish.
7. Back to the browser **us-visa** web page, go to `View -> Developer -> JavaScript console ` (or hit F12) tab.
8. Paste the script with the new values in it.
9. Wait for the audio to play. When it does, run for it (**I mean it!**) and try to schedule the date (select a different city and then selected the desired city again from the drop list to refresh the calendar).
10. That's it.

#### Tips

- Based on nothing, but pure empiricism, it seems that Fridays around 17:15 UTC are a good day to find new available dates. Just saying.
- Baby steps. Get a not so good date first, then update the `maxFormattedDate` value with a new slightly better date and keep repeating the process until you get the pair **date/city** that suits you the best.
