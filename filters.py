import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from scipy import signal
import scipy

class filters:
    def __init__(self) :
        self.phaseResponse=np.zeros(512)
        self.allPassResponse=np.zeros(512)
        self.resultAllPassFilter=[]
        self.real_poles_values=[]
        self.real_zeros_values=[]
        self.img_zeros_values=[]
        self.img_poles_values=[]
        self.zeros_complex=[]
        self.poles_complex=[]
        self.norm_freq=[]
        self.magnitudeResponse=[]
        self.frequencies=[]
       

    def set_real_poles(self,values):
        # self.real_poles_values=[]
        self.real_poles_values = values
    
    def set_real_zeros(self,values):
        # self.real_zeros_values=[]
        self.real_zeros_values = values

    def set_img_poles(self,values):
        # self.img_poles_values=[]
        self.img_poles_values = values
    
    def set_img_zeros(self,values):
        # self.img_zeros_values=[]
        self.img_zeros_values = values
    
    def get_magnitude_phase_response(self):
        self.zeros_complex=[]
        self.poles_complex=[]
        self.norm_freq=[]
        self.magnitudeResponse=[]
        self.phaseResponse=[]
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
        freq, complex_gain = signal.freqz_zpk(self.zeros_complex, self.poles_complex, 1)
        self.norm_freq = freq / max(freq)
        self.magnitudeResponse = 20 * np.log10(np.abs(complex_gain))
        self.phaseResponse = np.unwrap(np.angle(complex_gain))
        # Convert the frequency response to two separate arrays for magnitude and phase
        response = {
        'frequency': np.array(self.norm_freq).tolist(),
        'magnitude': np.array(self.magnitudeResponse).tolist(),
        'phase': np.array(self.phaseResponse).tolist()
    }
        return response
  
   
    def allPass_Filter(self, filtercoeffients):
       phaseAngles=np.zeros(512)
       for coeffient in filtercoeffients:
            w, h =signal.freqz([-np.conj(coeffient), 1.0], [1.0, -coeffient])
            angles = np.zeros(512) if coeffient==1 else np.unwrap(np.angle(h))
            phaseAngles = np.add(phaseAngles, angles)
            self.frequencies=w/max(w)
            self.allPassResponse=phaseAngles
            self.resultFilter()

           
       
    def resultFilter(self):
        self.resultAllPassFilter=np.add(self.allPassResponse,self.phaseResponse)
        
        