import json
import sys
import os
import sys
import requests
from requests_oauthlib import OAuth2Session
import warnings
from dotenv import dotenv_values

warnings.filterwarnings("ignore")
env_vars = dotenv_values()

client_id = env_vars['client_id']
access_token = env_vars['access_token']
root_cert = env_vars['root_cert']

c_default = '\033[0m'
c_error = '\033[91m'
c_warning = '\033[93m'
c_pink = '\033[95m'

path_to_json = sys.argv[1]
path_to_new_file = os.path.join(os.path.dirname(__file__), 'all_links.json')

if len(sys.argv) >= 3:
    path_to_new_file = sys.argv[2]

oauth2 = OAuth2Session(client_id, token={'access_token': access_token})

links = []
working = []
oauth2_error = []
broken = []
loading = ['|', '/', '-', '\\']
pos = 0

with open(path_to_json) as f:
    json_list = []
    for line in f:
        try:
            data = json.loads(line)
            json_list.append(data)
        except ValueError:
            continue

for index, item in enumerate(json_list):
    if 'HTTPSConnection' in item['info']:
        url = item['uri']

        if url.startswith('http:'):
            url = url.replace('http:', 'https:')

        try:
            print(
                c_pink + f'Checking links... ({index}/{len(json_list)}) [{loading[pos]}]' + c_default, end='\r')
            if pos == 3:
                pos = 0
            else:
                pos += 1

            response = oauth2.get(url, verify=root_cert)

            if response.status_code == requests.codes.ok:
                links.append({'url': url, 'info': 'working'})
                working.append(url)
            else:
                links.append({'url': url, 'info': 'broken'})
                broken.append(url)

        except:
            try:
                response = oauth2.get(url, verify=False)

                if response.status_code == requests.codes.ok:
                    links.append({'url': url, 'info': 'working'})
                    working.append(url)
                else:
                    links.append(
                        {'url': url, 'info': 'OAuth2 Connection Error'})
                    oauth2_error.append(url)
                    print(c_warning +
                          f'Certificate error in URL: {url}' + c_default)
            except:
                links.append({'url': url, 'info': 'broken'})
                broken.append(url)
                print(c_error + f'Link broken at URL: {url}' + c_default)

os.mkdir('output')
with open('output/working.txt', 'w') as f:
    for url in working:
        f.write(url + '\n')

with open('output/oauth2_error.txt', 'w') as f:
    for url in oauth2_error:
        f.write(url + '\n')

with open('output/broken.txt', 'w') as f:
    for url in broken:
        f.write(url + '\n')

with open('output/' + path_to_new_file, 'w') as f:
    json.dump(links, f)

print('\nDone.')
