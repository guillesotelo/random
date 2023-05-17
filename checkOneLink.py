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

url = sys.argv[1]

oauth2 = OAuth2Session(client_id, token={'access_token': access_token})

if url.startswith('http:'):
    url = url.replace('http:', 'https:')

try:
    response = oauth2.get(url, verify=root_cert)

    if response.status_code == requests.codes.ok:
        print('Link working OK')
    else:
        print('Link broken or timed out')

except:
    try:
        response = oauth2.get(url, verify=False)

        if response.status_code == requests.codes.ok:
            print('Link working OK')
        else:
            print('Certification error')
    except:
        print('Link broken or timed out (second attempt)')
