from flask import Flask, redirect, request, session, jsonify, render_template
import requests
from dotenv import load_dotenv
import os
from datetime import datetime
import urllib.parse
from urllib.parse import urljoin

load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
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

@app.route('/callbacks')
def callbacks():
    if 'error' in request.args:
        return jsonify({'error': request.args['error']})
    
    if 'code' in request.args:
        req_body = {
            'code': request.args['code'],
            'grant_type': 'authorization_code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET
        }

        response = requests.post(TOKEN_URL, data=req_body)
        token_info = response.json()

        session['access_token'] = token_info['access_token']  
        session['refresh_token'] = token_info['refresh_token']  
        session['expires_at']= datetime.now().timestamp() + token_info['expires_in']

        return redirect('/playback-sdk')

@app.route('/playback-sdk')
def playback_sdk():
    return render_template('player.html')

@app.route('/refresh-token')
def refresh_token():
    if 'refresh_token' not in session:
        return redirect('/login')
    
    if datetime.now().timestamp() > session['expires_at']:
        req_body = {
            'grant_type':'refresh_token',
            'refresh_token':session['refresh_token'],
            'client_id':CLIENT_ID,
            'client_secret': CLIENT_SECRET
        }    

        response = request.post(TOKEN_URL, data=req_body)
        new_token_info = response.json()
        session['access_token'] = new_token_info['access_token']
        session['expires_at']= datetime.now().timestamp() + new_token_info['expires_in']

        return redirect('/playback-sdk')
    
@app.route('/get_spotify_token')
def get_spotify_token():
    if 'access_token' not in session:
        return redirect('/refresh-token')
    return jsonify({'access_token':session['access_token']})


    

if __name__ == '__main__':
    app.run(debug=True)
