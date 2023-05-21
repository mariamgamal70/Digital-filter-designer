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

# @app.route('/getMagnitudeAndPhase', methods=['GET', 'POST'])
# def getMagnitudeAndPhase():


if __name__ == '__main__':
    app.run(debug=True, threaded=True)