import os
import json
import datetime
import uuid
from flask import Blueprint, jsonify, request
from flaskwebpush.webpush.redis import redis_webpush


VAPID_PRIVATE_KEY_PATH = os.getenv("VAPID_PRIVATE_KEY_PATH")
VAPID_PUBLIC_PATH = os.getenv("VAPID_PUBLIC_PATH")
VAPID_CLAIM_PATH = os.getenv("VAPID_CLAIM_PATH")
VAPID_PRIVATE_KEY = open(VAPID_PRIVATE_KEY_PATH, "r+").readline().strip("\n")
VAPID_PUBLIC_KEY = open(VAPID_PUBLIC_PATH, "r+").read().strip("\n")
VAPID_CLAIMS = {"sub":"mailto:youremail@example.com"}


api = Blueprint('api', __name__)


@api.route('/')
def status():
    return 'ok'


@api.route('/subscribe', methods=['GET', 'POST'])
def subscribe():
    if request.method == "GET":
      return jsonify({'public_key': VAPID_PUBLIC_KEY})

    print(request.json)

    subscription_info = {
      'endpoint': request.json.get('endpoint'),
      'keys': request.json.get('keys'),
      'expiration_time': request.json.get('expirationTime'),
    }

    webpush_key = str(uuid.uuid4())

    redis_webpush.set('webpush:subscription:info:{}'.format(webpush_key), json.dumps(subscription_info))
    redis_webpush.sadd('webpush:subscriptions', webpush_key)

    return jsonify({'id': webpush_key})


@api.route('/unsubscribe', methods=['POST'])
def unsubscribe():
    webpush_key = request.json.get('client_uuid')

    if not webpush_key:
      return jsonify({'message': 'client_uuid is required'}), 400

    redis_webpush.delete('webpush:subscription:info:{}'.format(webpush_key))
    redis_webpush.srem('webpush:subscriptions', webpush_key)

    return jsonify({'message': 'unsubscribed'})


@api.route('/notify', methods=['POST'])
def notify():
    from pywebpush import webpush, WebPushException
    count = 0
    sub_webpush_key = 'webpush:subscription:info:{}'

    message_data = {
      'title': request.json.get('title'),
      'body': request.json.get('body'),
      'url': request.json.get('url'),
    }

    for key in redis_webpush.smembers('webpush:subscriptions'):
        try:
            sub_key = sub_webpush_key.format(key.decode())
            sub_val = redis_webpush.get(sub_key)
            if sub_val:
              webpush(
                  subscription_info=json.loads(sub_val),
                  data=json.dumps(message_data),
                  vapid_private_key=VAPID_PRIVATE_KEY,
                  vapid_claims=VAPID_CLAIMS
              )
              count += 1
        except WebPushException as e:
            print(e)


    return "{} notification(s) sent".format(count)
