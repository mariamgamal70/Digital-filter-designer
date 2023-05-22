from scipy import signal
from flask import Flask, request, render_template
import numpy as np
from flask import jsonify
import json
import os
import pandas as pd
from flask import redirect, url_for
import math
from Filter import Filter

app = Flask(__name__)

filters =Filter()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/getMagnitudeAndPhase', methods=['POST'])
def getMagnitudeAndPhase():
    real_zeros = request.form.getlist('realZeros')
    real_poles = request.form.getlist('realPoles')
    img_zeros = request.form.getlist('imgZeros')
    img_poles = request.form.getlist('imgPoles')

    real_poles_values = np.array([float(value) for element in real_poles if element for value in element.split(',')])
    real_zeros_values = np.array([float(value) for element in real_zeros if element for value in element.split(',')])
    img_zeros_values = np.array([float(value) for element in img_zeros if element for value in element.split(',')])
    img_poles_values = np.array([float(value) for element in img_poles if element for value in element.split(',')])
    filters.set_real_poles(real_poles_values)
    filters.set_real_zeros(real_zeros_values)
    filters.set_img_zeros(img_zeros_values)
    filters.set_img_poles(img_poles_values)
    
    return jsonify(filters.get_magnitude_phase_response())

if __name__ == '__main__':
    app.run(debug=True, threaded=True)