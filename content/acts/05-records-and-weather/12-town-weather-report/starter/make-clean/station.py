"""Reading and cleaning the station book. No charts and no printing in here.

ledger.csv is the station book as it was typed: one row per month, with
  month   the year and month, like 1925-01 (one volunteer wrote 1933-4)
  temp    the month's average temperature, in the unit beside it
  unit    F or C, as written: the book was kept in Fahrenheit until 1960
  rain    the month's rain, in millimetres
  sun     the month's hours of sunshine; the recorder was away from 1941 to 1945

to_celsius(fahrenheit)    degrees C from degrees F, (F - 32) * 5 / 9. Works on a
                          single number or a whole column at once.

load_station(path)        the cleaned station book: a DataFrame with the columns
                          year, month, temp, rain, sun, in that order.
                          - year and month are whole numbers
                          - temp is in degrees C, whatever unit it was written in;
                            converted ones are rounded to one decimal place, as
                            the rest of the book was kept
                          - sun is a number, missing where nothing was measured
                          - each month appears once, in order, and the rows are
                            labelled 0, 1, 2 and so on
                          The file itself is never changed.

missing_months(station)   a list of the months, as text like "1941-03", that have
                          no row between the station book's first month and its
                          last. [] if there are none.
"""
# Fahrenheit until the end of 1960, Celsius after. The volunteers typed them
# as they were written and marked which was which. Read the numbers without
# the marks and the 1950s come out tropical.
import pandas as pd
