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

@app.route('/applyFilter', methods=['POST'])
def apply_filter():
    # Get the input data from the request
    data = request.form.getlist('amplitude')
    data = [float(value) for element in data for value in element.split(',')]
    # Calculate the filter coefficients from the zeros and poles
    # filters.calculate_filter_coeffs()
    # Apply the filter to the data
    filtered_data = filters.apply_filter(np.array(data))
    # Convert complex numbers to a JSON serializable format
    filtered_data = [value.real for value in filtered_data]
    # Return the filtered data as a JSON response
    response = {'filteredData': filtered_data}
    return jsonify(response)

@app.route('/allPass_originalPhase', methods=['POST'])
def apply_allPass_originalPhase_Filter():
        filters_data = request.form.getlist("filters")
        filter_strings = [item.strip() for item in filters_data[0].split(",")]
        # coefficients = [complex(filter_data) for filter_data in filters_data]
        filters.allPass_originalPhase_Filter(filter_strings)
        response_data = {
            'frequency': list(filters.frequencies),
            'phase': list(filters.allPassResponse),
            'total_phase': list(filters.resultAllPassFilter)
        }
        return jsonify(response_data)
    
@app.route('/getAllPass', methods=['POST'])
def getAllPass():
    complex_num_str = request.form['complexno']
    allpass_response_trace= filters.getAllPassResponse(complex_num_str)
    # Convert ndarray to a list
    allpass_response_trace['frequency'] = allpass_response_trace['frequency'].tolist()
    allpass_response_trace['allpassresponse'] = allpass_response_trace['allpassresponse'].tolist()
    return json.dumps(allpass_response_trace)

@app.route('/allPassOuput', methods=['POST'])
def getAllPassOutput():
        filters_data = request.form.getlist("filters")
        filter_strings = [item.strip() for item in filters_data[0].split(",")]
        data = request.form.getlist('amplitude')
        data = [float(value) for element in data for value in element.split(',')]
        filtered_data= filters.allPassOutput(filter_strings,data)
        # Convert complex numbers to a JSON serializable format
        filtered_data = [value.real for value in filtered_data]
        print("filtered_data",filtered_data)
        # Return the filtered data as a JSON response
        response = {'filteredData': filtered_data}
        return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, threaded=True)