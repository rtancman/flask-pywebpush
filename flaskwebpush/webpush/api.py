import os
import datetime
import uuid
from flask import Blueprint, jsonify, request
from flaskwebpush.webpush.redis import redis_webpush

VAPID_PRIVATE_KEY_PATH = os.getenv("VAPID_PRIVATE_KEY_PATH")
VAPID_PUBLIC_PATH = os.getenv("VAPID_PUBLIC_PATH")


WEBPUSH_VAPID_PRIVATE_KEY = open(VAPID_PRIVATE_KEY_PATH, "r+").readline().strip("\n")
WEBPUSH_VAPID_PUBLIC_KEY = open(VAPID_PUBLIC_PATH, "r+").read().strip("\n")


VAPID_CLAIMS = {
  "sub": "mailto:youremail"
}


api = Blueprint('api', __name__)


@api.route('/')
def status():
    return 'ok'


@api.route('/subscribe', methods=['OPTIONS', 'POST'])
def subscribe():
    # import pdb; pdb.set_trace()
    subscription_info = request.json.get('subscription_info')
    # if is_active=False == unsubscribe
    is_active = request.json.get('is_active')

    webpush_key = str(uuid.uuid4())

    redis_webpush.set('webpush:subscription:info:{}'.format(webpush_key), subscription_info)
    redis_webpush.sadd('webpush:subscriptions', webpush_key)

    return jsonify({ 'id': webpush_key })


@api.route('/notify', methods=['OPTIONS', 'POST'])
def notify():
    from pywebpush import webpush, WebPushException
    count = 0
    sub_webpush_key = 'webpush:subscription:info:{}'
    # import pdb; pdb.set_trace()
    for key in redis_webpush.smembers('webpush:subscriptions'):
        try:
            sub_key = sub_webpush_key.format(key.decode())
            sub_val = redis_webpush.get(sub_key)
            if sub_val:
              webpush(
                subscription_info={
                "endpoint": "https://push.example.com/v1/12345",
                "keys": {
                    "p256dh": "0123abcde...",
                    "auth": "abc123..."
                }},
                data="Mary had a little lamb, with a nice mint jelly",
                vapid_private_key=WEBPUSH_VAPID_PRIVATE_KEY,
                vapid_claims={
                    "sub": "mailto:YourNameHere@example.org",
                }
              )
              count += 1
        except WebPushException as ex:
            print("webpush fail")


    return "{} notification(s) sent".format(count)
