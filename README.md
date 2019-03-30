# flask-pywebpush
Flask Web Push Notification

Projeto para demonstrar a utilização do Web Push Notifications. Esta relacionado ao post [Criando um sistema de notificações com  pywebpush](https://www.rtancman.com.br/python/criando-sistema-de-notificações-com-pywebpush.html)


# Rodando o projeto

Este projeto roda no linux ou mac e precisa das seguintes dependencias instaladas:

- docker
- openssl
- python3
- yarn

**OBS: Sinta-se a vontade para rodar win e pf mande um PR ;)**

1. Clone o repositório e entre no diretorio.
2. Crie um virtualenv com Python 3.5
3. Ative o virtualenv.
4. Instale as dependências
5. Execute o redis
6. Execute a api
7. Execute o site web

```console
git clone git@github.com:rtancman/flask-pywebpush.git && cd flask-pywebpush
python -m venv .venv
source .venv/bin/activate
make setup setup.web
make run.redis
make run.api
make run.web
```
