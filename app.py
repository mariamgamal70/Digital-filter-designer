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

@app.route('/getMagnitudeAndPhase', methods=['POST'])
def getMagnitudeAndPhase():
    real_zeros = request.form.getlist('realZeros')
    real_poles = request.form.getlist('realPoles')
    img_zeros = request.form.getlist('imgZeros')
    img_poles = request.form.getlist('imgPoles')
    real_poles_values = np.array([float(value) for element in real_poles for value in element.split(',')])
    real_zeros_values = np.array([float(value) for element in real_zeros for value in element.split(',')])
    img_zeros_values = np.array([float(value) for element in img_zeros for value in element.split(',')])
    img_poles_values = np.array([float(value) for element in img_poles for value in element.split(',')])

    print("real_zeros",real_poles_values)
    print("real_poles",real_zeros_values)
    print("img_zeros",img_zeros_values)
    print("img_poles",img_poles_values)
    zeros_complex=[]
    poles_complex=[]
    for real, img in zip(real_poles_values, img_poles_values):
        if real and img:
            poles_complex.append(complex(float(real), float(img)))
    for real, img in zip(real_zeros_values, img_zeros_values):
        if real and img:
            zeros_complex.append(complex(float(real), float(img)))

    # Calculate the frequency response using the zeros and poles
    freq, complex_gain = signal.freqz_zpk(zeros_complex, poles_complex, 1)
    mag = 20 * np.log10(np.abs(complex_gain))
    phase = np.unwrap(np.angle(complex_gain))

    # Convert the frequency response to two separate arrays for magnitude and phase
    response = {'frequency': freq.tolist(), 'magnitude': mag.tolist(),'phase': phase.tolist()}
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, threaded=True)