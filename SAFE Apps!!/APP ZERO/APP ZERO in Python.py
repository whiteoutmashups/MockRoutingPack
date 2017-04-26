import requests
import json

url = 'http://localhost:8100/auth'

params = dict(
    app=dict(name='My Awesome App',id='testid',version='0.0.1',vendor='blah'),
    permissions=["SAFE_DRIVE_ACCESS"]
)

response = requests.post(url,
	data=json.dumps(params),
	headers={'content-type': 'application/json'})

print (response.status_code)