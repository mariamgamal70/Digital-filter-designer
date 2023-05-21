from scipy import signal
from flask import Flask, request, render_template
import numpy as np
from flask import jsonify
import json
import os
import pandas as pd
from flask import redirect, url_for
import math
app = Flask(__name__)

def polar_to_rectangular(radius, angle):
    real = radius * math.cos(angle)
    imaginary = radius * math.sin(angle)
    return real, imaginary

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/getMagnitudeAndPhase', methods=['GET', 'POST'])
def getMagnitudeAndPhase():
    zeros = request.form.getlist('zeros')
    poles = request.form.getlist('poles')
    zeros = [complex(z) for z in zeros]
    poles = [complex(p) for p in poles]

    # Calculate the frequency response using the zeros and poles
    w, h = signal.freqz_zpk(zeros, poles, worN=1024)
    mag = np.abs(h)
    phase = np.angle(h)

    # Convert the frequency response to a JSON object and return it
    response = {'magnitude': mag.tolist(), 'phase': phase.tolist()}
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, threaded=True)