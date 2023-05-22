from scipy import signal
import numpy as np

class Filter:
    def __init__(self) :
        self.real_poles_values=[]
        self.real_zeros_values=[]
        self.img_zeros_values=[]
        self.img_poles_values=[]
        self.zeros_complex=[]
        self.poles_complex=[]
        self.norm_freq=[]
        self.mag=[]
        self.phase=[]

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
        self.mag=[]
        self.phase=[]
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
        self.mag = 20 * np.log10(np.abs(complex_gain))
        self.phase = np.unwrap(np.angle(complex_gain))
        # Convert the frequency response to two separate arrays for magnitude and phase
        response = {
        'frequency': np.array(self.norm_freq).tolist(),
        'magnitude': np.array(self.mag).tolist(),
        'phase': np.array(self.phase).tolist()
    }
        return response