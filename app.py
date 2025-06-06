from flask import Flask, redirect, request, session, jsonify, render_template
import requests
from dotenv import load_dotenv
import os
from datetime import datetime
import urllib.parse


app = Flask(__name__)
app.secret_key = os.urandom(24)

CLIENT_ID= '159372d681ca4c17bcaedfd6a762f543'
CLIENT_SECRET= '59550aa41eca4c928d430ebaed686e2f'
REDIRECT_URI = 'http://127.0.0.1:5000/callbacks'
AUTH_URL= 'https://accounts.spotify.com/authorize'
TOKEN_URL = 'https://accounts.spotify.com/api/token'
API_BASE_URL = 'https://api.spotify.com/v1/'


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    scope='streaming app-remote-control user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played playlist-read-private playlist-modify-public playlist-modify-private user-top-read'
    params = {
        'client_id':CLIENT_ID,
        'response_type':'code',
        'scope':scope,
        'redirect_uri':REDIRECT_URI,
        'show_dialog':True #Make sure the user always has to login for debug purposes
    }
    auth_url = f"{AUTH_URL}?{urllib.parse.urlencode(params)}"
    return redirect(auth_url)








if __name__ == '__main__':
    app.run(debug=True)