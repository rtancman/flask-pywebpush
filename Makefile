VAPID_CLAIM_PATH ?= flaskwebpush/certs/claim.json
VAPID_PRIVATE_KEY_PATH ?= flaskwebpush/certs/private_key.txt
VAPID_PUBLIC_PATH ?= flaskwebpush/certs/public_key.txt

run.web:
	cd web && yarn start

run.api:
	VAPID_CLAIM_PATH=$(VAPID_CLAIM_PATH) VAPID_PRIVATE_KEY_PATH=$(VAPID_PRIVATE_KEY_PATH) VAPID_PUBLIC_PATH=$(VAPID_PUBLIC_PATH) python run.py

run.redis:
	docker run --name "webpush-redis" -d --rm -p 6379:6379 redis:latest

stop.redis:
	docker kill webpush-redis

setup:
	pip install -r requirements.txt

setup.web:
	cd web && yarn install

generate.vapid:
	mkdir -p flaskwebpush/certs
	openssl ecparam -name prime256v1 -genkey -noout -out flaskwebpush/certs/vapid_private.pem
	openssl ec -in flaskwebpush/certs/vapid_private.pem -pubout -out flaskwebpush/certs/vapid_public.pem
	openssl ec -in flaskwebpush/certs/vapid_private.pem -outform DER|tail -c +8|head -c 32|base64|tr -d '=' |tr '/+' '_-' > flaskwebpush/certs/private_key.txt
	openssl ec -in flaskwebpush/certs/vapid_private.pem -pubout -outform DER|tail -c 65|base64|tr -d '=' |tr '/+' '_-' > flaskwebpush/certs/public_key.txt