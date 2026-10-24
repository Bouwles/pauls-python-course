# Where stornowaydata.txt came from

**What it is.** The Met Office's historic monthly data for Stornoway Airport, on the Isle of Lewis (58.214 N, 6.318 W, 15 metres above sea level), from July 1873 to September 2026. One row per month: mean daily maximum temperature (`tmax`, degrees C), mean daily minimum temperature (`tmin`, degrees C), days of air frost (`af`), total rainfall (`rain`, mm) and total sunshine (`sun`, hours). Sunshine was first recorded in 1929.

**Where.** https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/stornowaydata.txt, listed on the Met Office's "Historic station data" page: https://www.metoffice.gov.uk/research/climate/maps-and-data/historic-station-data

**When.** Downloaded on 24 October 2026. The file is updated every month, so a later copy will have more rows, and some provisional values may have changed.

**Unchanged.** The file is exactly as downloaded, including its header lines, its marks and its Windows line endings.

**The marks, in the Met Office's words.**

- `*` after a value: estimated. These are point values interpolated to the station from the HadUK-Grid dataset.
- `---`: missing, meaning more than two days were missing in that month.
- `#` after a sunshine value: measured by an automatic Kipp & Zonen sensor. Unmarked sunshine came from a Campbell-Stokes recorder. At Stornoway the sensor takes over in September 2002.
- `Provisional` at the end of a row: not yet through the Met Office's full quality control.

The Met Office adds that these station series "may include small changes in site location or instrumentation through time", and that one station can't give a complete picture of the UK's climate.

**Licence.** Crown copyright, Met Office. Used under the Open Government Licence for Public Sector Information v3.0: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/

Anything you publish from it should carry this attribution:

> Contains public sector information licensed under the Open Government Licence v3.0. Source: Met Office.
