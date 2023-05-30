# Digital-filter-designer
## Table of contents:
- [Introduction](#introduction)
- [Project Structure](#project-structure)
- [Project Features](#project-features)
- [Getting Started](#getting-started)
- [Team](#team)


### Introduction
A website that helps users to design a custom digital filter via zeros-poles placement on the z-plane.

### Project Structure
The Web Application is built using:
- Frontend:
  - BootStrap
  - HTML
  - CSS
  - JavaScript
- Backend framework:
  - Flask (Python)

The Frontend main function to set the structure of the page and plot the signals and manage
the user interface, while the Backend is responsible for performing signal filtering operations.

```
master
├─ data
│  ├─ sample single (csv)
│  └─ project documentation (pdf)
├─ static (JS & CSS files)
│  ├─  css
│  └─  js
├─ templates (HTML file)
├─ app.py (Back-End Server)
├─ filter.py (Filtering class)
└─ README.md
```

### Project Features
Website has the following features:
> 1. A plot for the z-plane with the unit circle, where the user can place different zeros and poles. The user can also 
make the following modifications:

- Modify the placed zeros/poles by dragging them:
- Click on a zero or pole and delete it
- Clear all zeros or clear all poles or clear all
- Has the option to add conjugates or not for the complex element

> 2.  Visualize the corresponding frequency response for the placed elements (One graph for the magnitude 
response and another graph for the phase response):

> 3.Upon finishing the filter design and visualizing the filter response, the user should be able to:
> 
- Apply the filter on a lengthy signal (minimum of 10,000 points) as if it is a real-time filtering process and visualize the difference between input and output signal.

> 4. Correct for the phase by adding some All-Pass filters through a library of all-pass filter or through a custom-built all-pass that the user can visualize.



### Getting Started
To get started with the digital filter designer web app, follow these steps:

1. Clone the repository:
``` 
git clone https://github.com/mariamgamal70/Digital-filter-designer.git
``` 
2. Install Python3 from:
``` 
www.python.org/downloads/
```
3. Install the following packages:-
   - Flask
   - scipy
   - numpy
 - Open Project Terminal & Run:
```
pip install -r requirements.txt
```
4. Open the application in your web browser by writing this in your terminal:
```
python app.py
```

### Note
The application has been tested on Google Chrome, Microsoft Edge and Mozilla Firefox web browsers.

### Team
Biomedical Signal Processing (SBEN311) class task created by:

| Team Members                                  
|-------------------------------------------------------
| [Nada Mohamed](https://github.com/NadaAlfowey)
| [Abdulmonem Elsherif](https://github.com/AbdulmonemElsherif)   
| [Asmaa Khalid](https://github.com/asmaakhaledd) 
| [Mariam Gamal](https://github.com/mariamgamal70)
      

     

### Submitted to:
- Dr. Tamer Basha & Eng. Christina Adly
