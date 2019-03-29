run:
	python run.py

setup:
	pip install -r requirements.txt

generate.vapid:
	mkdir -p flaskwebpush/certs
	openssl ecparam -name prime256v1 -genkey -noout -out flaskwebpush/certs/vapid_private.pem
	openssl ec -in flaskwebpush/certs/vapid_private.pem -pubout -out flaskwebpush/certs/vapid_public.pem
	openssl ec -in flaskwebpush/certs/vapid_private.pem -outform DER|tail -c +8|head -c 32|base64|tr -d '=' |tr '/+' '_-' >> flaskwebpush/certs/private_key.txt
	openssl ec -in flaskwebpush/certs/vapid_private.pem -pubout -outform DER|tail -c 65|base64|tr -d '=' |tr '/+' '_-' >> flaskwebpush/certs/public_key.txt