# Credits

## Art

The six characters (Paul, Neil, Aaesha, Caitlin, Riya and Yahya), the learner's avatar, the Clocktower and its rooms, and the Shelf objects are **pixel art drawn in code for this project** (`lib/pixel/`, described in `art/README.md`). Each person is put together pixel by pixel from a look and a moment (a face, a gesture, a blink, a word half said), so they can talk and react. The same code draws the certificates' and share cards' people.

The logo, a pixel snake curled into a P, was drawn for this project (`lib/pixel/mark.ts`; the favicons, `public/brand/mark.svg` and `public/og.png` are made from it by `scripts/build-brand.tsx`). So was the small pixel heart in the "Made with love" credit line.

## Fonts (self-hosted)

| Font | Use | Author | Licence |
| --- | --- | --- | --- |
| Fredoka | The display face: titles, names, buttons, labels, the wordmark, certificates and share cards | The Fredoka Project Authors | SIL OFL 1.1 |
| Atkinson Hyperlegible Next | Text and interface | Braille Institute of America | SIL OFL 1.1 |
| JetBrains Mono | Code | JetBrains | SIL OFL 1.1 |

All three come from Fontsource (`@fontsource/fredoka`, `@fontsource/atkinson-hyperlegible-next`, `@fontsource-variable/jetbrains-mono`); the server-drawn images use their static `.woff` files.

## Icons

| Icons | Licence |
| --- | --- |
| pixelarticons, by Gerrit Halfmann, through `pixelarticons` | MIT |
| The duck and the crab, drawn for this project on the same 24-pixel grid to match (`components/ui/Icon.tsx`) | Part of this project |

## Software

| Package | Use | Licence |
| --- | --- | --- |
| Pyodide | Python in the browser and in content tests | MPL-2.0 |
| CodeMirror 6, Lezer | Editor, highlighting | MIT |
| Next.js, React | Framework | MIT |
| ts-fsrs | Spaced repetition scheduling | MIT |
| @electric-sql/pglite | Local Postgres for development and tests | Apache-2.0 / PostgreSQL |
| postgres | Postgres driver for production | Unlicense |
| @supabase/supabase-js, @supabase/ssr | Auth in production | MIT |
| zod, yaml, marked | Content validation and rendering | MIT, ISC, MIT |
| idb | IndexedDB wrapper | ISC |
| fflate | Zip export | MIT |
| next/og (@vercel/og: Satori and resvg) | Certificates and share cards, drawn on the server | MPL-2.0 |

## Sound

All sounds (the door bell, the typewriter key, the stamp, the dialogue blip) are synthesised in the browser with Web Audio in `lib/sound.ts`; there are no recordings. Any recorded sounds added must be CC0 and credited here.

## Datasets

Every real public dataset a project uses, with its source and licence. Each project bundles a small copy in its `data/` folder so it works offline.

| Dataset | Project | Source | Licence | Bundled as |
| --- | --- | --- | --- | --- |
| The SMS Spam Collection, by Tiago A. Almeida and José María Gómez Hidalgo | The spam filter results shown on the home page | https://archive.ics.uci.edu/dataset/228/sms+spam+collection | CC BY 4.0 | Not bundled: the home page shows only a confusion matrix worked out from it (150, 9, 16 and 940 on 1,115 held-out messages) |
| Met Office historic station data, Stornoway Airport, monthly, 1873 to 2026 | Weather Data Investigation (Act IX) | https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/stornowaydata.txt | Open Government Licence v3.0, Crown copyright, Met Office. "Contains public sector information licensed under the Open Government Licence v3.0. Source: Met Office." | `content/acts/09-lighthouse/02-capstone-investigation/data/stornowaydata.txt`, unchanged from the download |
| EFF short word list for passphrases (Short Wordlist 1, 1,296 words) | Password Generator (Act II) | https://www.eff.org/dice | CC BY 4.0, Electronic Frontier Foundation (https://www.eff.org/copyright) | `content/acts/02-high-street/01-password-generator/data/wordlist.txt`: dice numbers removed, and yo-yo taken out so a hyphen always separates words (1,295 words) |
| *Alice's Adventures in Wonderland*, by Lewis Carroll, Project Gutenberg eBook #11 | Word Counter and Text Analyser (Act II) | https://www.gutenberg.org/ebooks/11 | Public domain. The Project Gutenberg header, licence and trademark were removed, which leaves the public-domain text. | `content/acts/02-high-street/04-library-catalogue/data/alice.txt`: only the text between the START and END markers, [Illustration] markers removed, curly quotes made straight, each em dash made a spaced double hyphen, runs of blank lines squeezed (145 KB) |
| Open-Meteo forecast API, a saved reply for Penzance (three days, daily) | Weather App (Act III) | https://open-meteo.com/en/docs | CC BY 4.0, "Weather data by Open-Meteo.com" (https://open-meteo.com/en/licence). The free API is for non-commercial use, under 10,000 calls a day (https://open-meteo.com/en/terms). | `content/acts/03-pier/01-weather-app/data/forecast.json`, and `daylight.json` (sunrise, sunset and daylight for the worked example): saved 25 October 2026, indented, no values changed |
| Open-Meteo geocoding API, a saved search for Penzance | Weather App (Act III) | https://open-meteo.com/en/docs/geocoding-api | CC BY 4.0; location data from GeoNames (https://www.geonames.org/), CC BY 4.0 | `content/acts/03-pier/01-weather-app/data/places.json`: saved 25 October 2026, indented, no values changed |
| Word counts from *Great Expectations*, by Charles Dickens (Project Gutenberg eBook #1400), and *Treasure Island*, by Robert Louis Stevenson (eBook #120) | Spell Checker (Act IV) | https://www.gutenberg.org/ebooks/1400 and https://www.gutenberg.org/ebooks/120 | Public domain. Only words and counts are kept: no text of either book, and none of Project Gutenberg's header, licence or trademark. | `content/acts/04-scrapyard/14-spell-checker/data/words.csv`: the text between the START and END markers of both books, lower-cased and split into words (letters, with apostrophes inside), counted, and the 7,709 words that appear at least twice kept with their counts (78 KB) |
| Student Performance, maths course (Cortez, 2008, collected for Cortez and Silva, 2008) | NumPy Grade Book (Act V) | https://archive.ics.uci.edu/dataset/320/student+performance (doi:10.24432/C5TG7T) | CC BY 4.0 | `content/acts/05-records-and-weather/01-arrays-not-lists/data/marks.csv`: from student-mat.csv, all 395 students, with an anonymous row number, the school, the marks G1, G2 and G3 (renamed first, second and final) and absences; every personal and family attribute dropped; checked against the original (7 KB) |
| Met Office historic station data, Stornoway Airport, monthly, 1925 to 2024 | Weather History Dashboard (Act V) | https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/stornowaydata.txt | Open Government Licence v3.0, Crown copyright, Met Office. "Contains public sector information licensed under the Open Government Licence v3.0." | `content/acts/05-records-and-weather/05-drawing-the-weather/data/stornoway.csv`: the 1,200 months from January 1925 to December 2024 as a CSV, every column kept; the * (estimated) markers moved into an `estimated` column, the # (Kipp & Zonen sunshine) markers dropped, missing values (---) left empty (37 KB) |
| "Cape Lookout Lighthouse October 2024", photograph by Mrmichaeltomato, Wikimedia Commons | Linear Algebra Lab (Act V) | https://commons.wikimedia.org/wiki/File:Cape_Lookout_Lighthouse_October_2024.jpg | CC0 1.0 (public domain) | `content/acts/05-records-and-weather/10-vectors-and-arrows/data/lighthouse.csv`: the 250-pixel thumbnail cropped to its middle 140 by 187 pixels, made greyscale (Pillow mode L) and shrunk to 48 by 64 with Lanczos resampling, one row of brightnesses (0 to 255) per row of pixels (12 KB) |
| House Sales in King County, USA (May 2014 to May 2015), a sample of 1,000 sales | House Price Predictor (Act VI) | https://www.kaggle.com/datasets/harlfoxem/housesalesprediction (copy used: OpenML dataset 42092, https://www.openml.org/d/42092) | CC0 1.0 (public domain), as released on Kaggle and OpenML | `content/acts/06-observatory-lower/01-drawing-the-best-line/data/king_county_houses.csv`: sales with 0 bedrooms, 0 bathrooms or 33 bedrooms dropped, each house's latest sale kept, 1,000 drawn at random (NumPy default_rng(2015)) and sorted by date, square feet turned into square metres, 11 of 21 columns kept (54 KB) |
| Student Performance, maths course (Cortez and Silva, 2008) | Exam Score Model (Act VI) | https://archive.ics.uci.edu/dataset/320/student+performance | CC BY 4.0 | `content/acts/06-observatory-lower/03-training-and-testing/data/students.csv`: from student-mat.csv, the 357 of 395 students with a final grade above 0, twelve columns kept and renamed (11 KB) |
| CDC Diabetes Health Indicators (from the CDC's BRFSS 2015 survey), a sample of 2,000 respondents | Diabetes Risk Classifier (Act VI) | https://www.kaggle.com/datasets/alexteboul/diabetes-health-indicators-dataset (copy used: https://archive.ics.uci.edu/dataset/891/cdc+diabetes+health+indicators) | CC0 1.0 (public domain); the survey is a US government work | `content/acts/06-observatory-lower/05-was-it-right/data/diabetes.csv`: 2,000 of 253,680 respondents drawn at random (NumPy default_rng(2015)), six answers and the diabetes or prediabetes flag kept and renamed (48 KB) |
| Palmer Archipelago penguins (Gorman, Williams and Fraser, 2014; palmerpenguins package by Horst, Hill and Gorman) | Iris and Penguins Classifier (Act VI) | https://allisonhorst.github.io/palmerpenguins/ | CC0 1.0 (public domain) | `content/acts/06-observatory-lower/06-nearest-neighbours/data/penguins.csv`: the 342 of 344 penguins with measurements, four measurements and the species (10 KB) |
| Iris (Fisher, 1936) | Iris and Penguins Classifier (Act VI) | https://archive.ics.uci.edu/dataset/53/iris | CC BY 4.0 | `content/acts/06-observatory-lower/06-nearest-neighbours/data/iris.csv`: bezdekIris.data (UCI's corrected copy) with column names, a flower number, and the Iris- prefix dropped (4 KB) |
| Statlog (German Credit Data) (Hofmann, 1994) | Loan Approval Tree (Act VI) | https://archive.ics.uci.edu/dataset/144/statlog+german+credit+data | CC BY 4.0 | `content/acts/06-observatory-lower/08-forests-and-boosting/data/loans.csv`: all 1,000 applicants, seven of twenty attributes kept with their codes turned into ordered numbers, and whether they repaid (25 KB) |
| Wholesale customers (Cardoso, 2014) | Customer Segmentation (Act VI) | https://archive.ics.uci.edu/dataset/292/wholesale+customers | CC BY 4.0 | `content/acts/06-observatory-lower/11-squashing-dimensions/data/customers.csv`: all 440 customers, channel and region written as words, columns renamed in lower case (20 KB) |
| Optical Recognition of Handwritten Digits (Alpaydin and Kaynak, 1998), as scikit-learn's load_digits | Handwritten Digit Recogniser, PyTorch Fundamentals, Image Classifier (Act VII) | https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits | CC BY 4.0 | Not copied: `notebooks.py` in each project loads the 1,797 digits that ship with scikit-learn |
| *Three Men in a Boat (To Say Nothing of the Dog)*, by Jerome K. Jerome, Project Gutenberg eBook #308 | Tiny GPT (Act VII) | https://www.gutenberg.org/ebooks/308 | Public domain. The Project Gutenberg header, footer and licence were removed before training. | Not copied: `content/acts/07-observatory-upper/12-paying-attention/data/gpt_weights.json` holds a small transformer trained on the lower-cased text (183 KB) |
