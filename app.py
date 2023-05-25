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
def apply_filter_route():
    # Get the input data from the request
    data = request.form.getlist('amplitude')
    data = [float(value) for element in data for value in element.split(',')]
    # Calculate the filter coefficients from the zeros and poles
    # filters.calculate_filter_coeffs()
    # Apply the filter to the data
    filtered_data = filters.apply_filter(data)
    # Convert complex numbers to a JSON serializable format
    filtered_data = [value.real for value in filtered_data]
    # Return the filtered data as a JSON response
    response = {'filteredData': filtered_data}
    return jsonify(response)

# @app.route('/allPass', methods=['POST', 'GET'])
# def applyAllPass():
#     filters = Filter()
#     filters_data = json.loads(request.data)
#     coefficients = []
#     for filter_data in filters_data:
#         complex_filter = complex(filter_data)
#         coefficients.append(complex_filter)
#     filters.allPass_Filter(coefficients)
#     response_data = json.dumps({
#         'frequency': list(filters.frequencies),
#         'phase': list(filters.allPassResponse),
#         'total phase': list(filters.resultAllPassFilter)
#     }, indent=None)
#     return response_data

@app.route('/allPass', methods=['POST'])
def applyAllPass():
        filters_data = request.form.getlist("filters")
        filter_strings = [item.strip() for item in filters_data[0].split(",")]
        # coefficients = [complex(filter_data) for filter_data in filters_data]
        filters.allPass_Filter(filter_strings)
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

if __name__ == '__main__':
    app.run(debug=True, threaded=True)