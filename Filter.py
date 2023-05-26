from scipy import signal
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import scipy
from scipy.signal import tf2zpk


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
        self.freq = []
        self.mag = []
        self.phase = np.zeros(512)

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
        self.freq = []
        self.mag = []
        self.phase = []
        for real, img in zip(self.real_poles_values, self.img_poles_values):
            if real and img:
                self.poles_complex.append(complex(round(float(real), 2), round(float(img), 2)))
        for real, img in zip(self.real_zeros_values, self.img_zeros_values):
            if real and img:
                self.zeros_complex.append(complex(round(float(real), 2), round(float(img), 2)))
        # # Remove pairs of zeros and poles that are at the same location
        for zero in self.zeros_complex:
            if zero in self.poles_complex:
                self.zeros_complex.remove(zero)
                self.poles_complex.remove(zero)
        # Calculate the frequency response using the zeros and poles
        freq, complex_gain = signal.freqz_zpk(
            self.zeros_complex, self.poles_complex, 1)
        self.freq = freq 
        self.mag = 20 * np.log10(np.abs(complex_gain))
        self.phase = np.unwrap(np.angle(complex_gain))
        # Convert the frequency response to two separate arrays for magnitude and phase
        response = {
            'frequency': np.array(self.freq).tolist(),
            'magnitude': np.array(self.mag).tolist(),
            'phase': np.array(self.phase).tolist()
        }
        print(self.zeros_complex)
        return response

    def apply_filter(self, inputsignal):
        # Convert the zeros and poles to filter coefficients
        print("self.zeros_complex",self.zeros_complex,"self.poles_complex",self.poles_complex)
        num_coeff, deno_coeff = signal.zpk2tf(
            self.zeros_complex, self.poles_complex, 1)
        # Apply the filter
        filter_order=max(len(self.zeros_complex), len(self.poles_complex))
        print(self.zeros_complex)
        if len(self.zeros_complex)==1 and len(self.poles_complex)==0 :
            if (self.zeros_complex[0].real>0 ):
                num_coeff, deno_coeff = signal.butter(4, 3,fs=1000 ,btype='high', analog=False, output='ba')
                print("highpass")
            elif (self.zeros_complex[0].real<0 ):
                num_coeff, deno_coeff = signal.butter(4, 5, fs=1000, btype='low', analog=False, output='ba')
                print("lowpass")
            elif self.zeros_complex[0].real==0 and self.zeros_complex[0].imag==1:
                num_coeff, deno_coeff = signal.iirnotch(5, 3, fs=1000)
                print("notch")
        elif len(self.zeros_complex)==0 and len(self.poles_complex)==1:
            if  self.poles_complex[0].real<0 and self.poles_complex[0].imag==0:
                num_coeff, deno_coeff = signal.butter(filter_order, 3, btype='high', fs=1000)
                print("highpass")
            elif self.poles_complex[0].real>0 and self.poles_complex[0].imag==0:
                num_coeff, deno_coeff = signal.butter(filter_order, 6, btype='low', fs=1000)
                print("lowpass")
        elif len(self.zeros_complex)==2 and len(self.poles_complex)==0:
            num_coeff, deno_coeff = signal.butter(filter_order, [2, 6], btype='band', fs=1000)
            print("bandpass")
        else:
            num_coeff, deno_coeff = signal.zpk2tf(
                self.zeros_complex, self.poles_complex, 1)
        print("else")
        output_signal = signal.lfilter(num_coeff, deno_coeff, inputsignal)
        # print(output_signal)
        return output_signal


    def allPass_originalPhase_Filter(self, filters_data):
        coefficients_complex = [complex(filterdata) for filterdata in filters_data]
        phaseAngles = np.zeros(512)
        w, h = signal.freqz([-np.conj(c) for c in coefficients_complex], [1.0] + [-c for c in coefficients_complex])
        angles = np.zeros(512) if coefficients_complex == 1 else np.unwrap(np.angle(h))
        phaseAngles = np.add(phaseAngles, angles)
        self.frequencies = w / max(w)
        self.allPassResponse = phaseAngles
        self.resultAllPassFilter = np.add(self.allPassResponse, self.phase, out=np.empty_like(self.allPassResponse), casting='unsafe')
        response ={
            'correctedphase': self.resultAllPassFilter
        }
        return response


    def getAllPassResponse(self, complex_num_str):
        complex_number = complex(complex_num_str)
        # Define the frequency range
        frequency_range = np.linspace(0, np.pi, 1000)
        # Calculate the allpass response
        allpass_response = np.angle((complex_number - np.exp(1j * frequency_range)) / (
            complex_number.conjugate() * np.exp(1j * frequency_range) - 1))
        response ={
            'frequency': frequency_range,
            'allpassresponse': allpass_response
        }
        return response

    def allPassOutput(self, complex_num_str,inputsignal):
        complex_arr= [ (complex(complexdata)) for complexdata in complex_num_str]
        # conjugate_arr= np.conjugate(complex_arr)
        # convert complex coefficients to real polynomial coefficients
        poly_coeffs = np.poly1d(complex_arr).coeffs.real
        # calculate the zeros, poles, and gain of the filter
        self.zeros_complex, self.poles_complex, gain = tf2zpk(poly_coeffs, [1])
        # self.zeros_complex = 1/conjugate_arr
        # self.poles_complex =complex_arr
        output=self.apply_filter(inputsignal)
        return output
