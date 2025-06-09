import time
from calendar import timegm
from datetime import datetime
from hashlib import sha256
import hmac
import base64

shared_secret = "pJPE5aOTULIPT8BYJnCm2w5e7Vr9ACTKbzEZHLgMZNum/+TE7NfmM7efe9C89naPzHcLbM6/WDt1vWITsULMNcztCNzgerdjZZsAS/g8+DBidG4F7wB2lq8zqMzlcBiRCkTARhLtllP49G3S2+SXQha3Hl1UdVwIcY5B8We/CaUPHS1G+kI8kWPPE1fd6pc9V8Qo2D3/HMbcVfEJaS0ZO22X+/8VWvQN4CbOAJ1ZG0n2MQvi+huDsw6H7cU0iAobkbpqaKvwU3MrHXN2SxxhmgH4yGH2/s0wt3AJX9R4Qh+Q4N66ia5PQKksmTIq1BGnV5EPacvHRPct14amgwDKLg=="
resource_path = "helloworld"
query_string = "apikey=ZJRLQEQRHQSNA8CGP91N21ZtQIrOXpKLTVS3jxvtEAllPh0rA"
request_body = ""

def _get_x_pay_token(shared_secret, resource_path, query_string, body):
    # 1. Base64 decode the shared secret
    secret_bytes = base64.b64decode(shared_secret)
    # 2. Timestamp in UTC seconds
    timestamp = str(timegm(datetime.utcnow().timetuple()))
    # 3. Build the pre-hash string
    pre_hash_string = timestamp + resource_path + query_string + body
    # 4. HMAC-SHA256, output hex digest
    hash_string = hmac.new(
        secret_bytes,
        msg=pre_hash_string.encode('utf-8'),
        digestmod=sha256
    ).hexdigest()
    return 'xv2:' + timestamp + ':' + hash_string

print(_get_x_pay_token(shared_secret, resource_path, query_string, request_body))