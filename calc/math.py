from .neuralnet import find,preprocess, detect, recognize
import os
from django.conf import settings
import numpy as np,cv2
def calc_image(img_url):
	results = find(img_url)
	return results;

def solve_image():
	return "Image solved"

def plot_image():
	return "Answer calculated"