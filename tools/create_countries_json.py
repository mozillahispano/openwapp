#! /bin/python3

# This script reads a csv-list of countries and writes it's contents to a json-file
# The csv-list must be called 'countries.csv'; the json-file will be called 'countries.json'
# Both files should be within the current directory.
# The csv-file should have the form
# mcc, junk, mnc, junk, country_code (e.g. 'de'), name, prefix (e.g. '43'), carrier
# and should contain a header line
# The json-file will contain list of countries as follows
#[
#    { 
#        "carriers": {
#            "{carrier_name}": [
#                {"mcc": "{mcc}", "mnc": "{mnc}"},
#                -------as above---------------
#            ],
#        }
#        "code": "{country_code}",
#        "full": "{country_name}",
#        "prefix": "{country_prefix}"   
#   },
#   ---------next country------
#]

import csv
import json

countries = {}
with open('countries.csv', newline='') as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        #print(list(row))
        mcc, _, mnc, _, iso, name, code, network = row
        if mcc == 'MCC' or name == 'Unknown Country' or iso == 'n/a' or network == '':
            #first line or garbage
            continue
        if name not in countries:
            country = countries[name] = {
                "full": name,
                "code": iso,
                "prefix": "+" + code,
                "carriers": {},
            }
        else:
            country = countries[name]
            if (country["full"] != name or
                country["code"] != iso or
                country["prefix"] != "+" + code):
                #continue
                print("Invalid: old country with iso {}".format(iso))
                print(country)
                print("New country:")
                print(row)
                print(code)
                continue
        if network not in country["carriers"]:
            country["carriers"][network] = []
        country["carriers"][network].append({"mcc": mcc, "mnc": mnc})
#output statistics
networks_with_one_mccmnc = 0
networks_with_more_mccmnc = 0
for country in countries.values():
    for mcc_mnc_list in country["carriers"].values():
        if len(mcc_mnc_list) > 1:
            networks_with_more_mccmnc += 1
        else:
            networks_with_one_mccmnc += 1
print("networks with one mccmnc: {}; with more mccmnc: {}".format(
    networks_with_one_mccmnc,
    networks_with_more_mccmnc
))
with open('countries.json', 'w') as jsonfile:
    jsonfile.write(json.dumps(list(countries.values()), sort_keys=True, indent=4, separators=(',', ': ')))

