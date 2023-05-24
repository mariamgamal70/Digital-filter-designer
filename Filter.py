from scipy import signal
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import scipy


class Filter:
    def __init__(self):
        self.allPassResponse = [np.zeros(512)]
        self.resultAllPassFilter = []
        self.frequencies = []
        self.real_poles_values = []
        self.real_zeros_values = []
        self.img_zeros_values = []
        self.img_poles_values = []
        self.zeros_complex = []
        self.poles_complex = []
        self.norm_freq = []
        self.mag = []
        self.phase = []

    def set_real_poles(self, values):
        # self.real_poles_values=[]
        self.real_poles_values = values

    def set_real_zeros(self, values):
        # self.real_zeros_values=[]
        self.real_zeros_values = values

    def set_img_poles(self, values):
        # self.img_poles_values=[]
        self.img_poles_values = values

    def set_img_zeros(self, values):
        # self.img_zeros_values=[]
        self.img_zeros_values = values

    def get_magnitude_phase_response(self):
        self.zeros_complex = []
        self.poles_complex = []
        self.norm_freq = []
        self.mag = []
        self.phase = []
        for real, img in zip(self.real_poles_values, self.img_poles_values):
            if real and img:
                self.poles_complex.append(complex(float(real), float(img)))
        for real, img in zip(self.real_zeros_values, self.img_zeros_values):
            if real and img:
                self.zeros_complex.append(complex(float(real), float(img)))
        # zeros_complex.extend([0] * real_zeros_values.tolist().count(0))
        # poles_complex.extend([0] * real_poles_values.tolist().count(0))
        # Remove pairs of zeros and poles that are at the same location
        for zero in self.zeros_complex:
            if zero in self.poles_complex:
                self.zeros_complex.remove(zero)
                self.poles_complex.remove(zero)
        # Calculate the frequency response using the zeros and poles
        freq, complex_gain = signal.freqz_zpk(
            self.zeros_complex, self.poles_complex, 1)
        self.norm_freq = freq / max(freq)
        self.mag = 20 * np.log10(np.abs(complex_gain))
        self.phase = np.unwrap(np.angle(complex_gain))
        # Convert the frequency response to two separate arrays for magnitude and phase
        response = {
            'frequency': np.array(self.norm_freq).tolist(),
            'magnitude': np.array(self.mag).tolist(),
            'phase': np.array(self.phase).tolist()
        }
        return response

    def apply_filter(self, inputsignal):
        # Convert the zeros and poles to filter coefficients
        num_coeff, deno_coeff = signal.zpk2tf(
            self.zeros_complex, self.poles_complex, 1)
        # Apply the filter
        output_signal = signal.lfilter(num_coeff, deno_coeff, inputsignal)

        return output_signal

    def allPass_Filter(self, filter_coefficients):
        phaseAngles = np.zeros(512)
        for coefficient in filter_coefficients:
            w, h = signal.freqz(
                [-np.conj(coefficient), 1.0], [1.0, -coefficient])
            angles = np.zeros(
                512) if coefficient == 1 else np.unwrap(np.angle(h))
            phaseAngles = np.add(phaseAngles, angles)
        self.frequencies = w / max(w)
        self.allPassResponse = phaseAngles
        self.resultFilter()

    def resultFilter(self):
        self.resultAllPassFilter = np.add(self.allPassResponse, self.phase)

    # def calculate_filter_coeffs(self):
    #     # Convert the zeros and poles to filter coefficients
    #     zeros = [complex(real, img) for real, img in zip(self.real_zeros_values, self.img_zeros_values)]
    #     poles = [complex(real, img) for real, img in zip(self.real_poles_values, self.img_poles_values)]
    #     self.b_coeffs, self.a_coeffs = self.get_filter_coeffs(zeros, poles)

    # def apply_filter(self, data):
    #     # Apply the filter to the data using the filtfilt function
    #     filtered_data = signal.filtfilt(self.b_coeffs, self.a_coeffs, data)
    #     return filtered_data

    def getAllPassResponse(self,complex_num_str):
        complex_number = complex(complex_num_str)

        # Define the frequency range
        frequency_range = np.linspace(0, np.pi, 1000)

        # Calculate the allpass response
        allpass_response = np.angle((complex_number - np.exp(1j * frequency_range)) / (complex_number.conjugate() * np.exp(1j * frequency_range) - 1))

        response={
            'frequency':frequency_range,
            'allpassresponse':allpass_response
        }
        return response