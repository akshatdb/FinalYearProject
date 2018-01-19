import cv2
import numpy as np
from scipy.io import loadmat
from keras.models import load_model
from PIL import Image
import os
from django.conf import settings
import tensorflow as tf
im_path = os.path.join(settings.BASE_DIR, 'media')
abs_path = os.path.join(settings.BASE_DIR, 'ai')
global model, graph
global modeldiv, graphdiv
global imgx,imgy
blankim = np.zeros((28,28))
kernel = np.ones((2,2),np.uint8)

def mnist_scale(img,xr,yr):
    x = int(28*xr)
    y = int(28*yr)
    if x<=0 or y<=0:
    	return None
    xg = (28-x)/2
    yg = (28-y)/2
    img = Image.fromarray(img)
    img = img.resize((x,y),Image.BICUBIC)
    img = np.asarray(img, dtype=np.uint8)
    imgb = np.copy(blankim)
    imgb[yg:yg+y,xg:xg+x] = img
    imgb = imgb.reshape((28, 28, 1)).astype('float32')
    imgb = np.array([imgb])
    return imgb

def detect_test_dnn(img,xr,yr):
	n_classes = 10
	imgb = mnist_scale(img,xr,yr)
	if imgb is None:
		return -1
	with graph.as_default():
		out = model.predict(imgb).reshape(n_classes)
	return np.argmax(out)

def div_test_dnn(img):
	n_classes = 2
	img = Image.fromarray(img)
	img = img.resize((28,28),Image.BICUBIC)
	img = np.asarray(img, dtype=np.uint8)
	img = img.reshape((28, 28, 1)).astype('float32')
	img = np.array([img])
	with graphdiv.as_default():
		out = modeldiv.predict(img).reshape(n_classes)
	return np.argmax(out)

def scale_down(img):
	x,y = img.shape
	for i in range(100): 
		if (x*i*0.01) > 800:
			break
		j = i
	x = int(x * (j*0.01))
	y = int(y * (j*0.01))
	img = Image.fromarray(img)
	img = img.resize((y,x),Image.BICUBIC)
	img = np.asarray(img, dtype=np.uint8)
	return img, y, x

def preprocess(img):
	img = cv2.adaptiveThreshold(img,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,cv2.THRESH_BINARY_INV,255,76)
	return img

def preprocess_num(img):
	img = cv2.adaptiveThreshold(img,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,cv2.THRESH_BINARY_INV,5,6)
	return img

def preprocess_drop(img):
 	img = cv2.adaptiveThreshold(img,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,cv2.THRESH_BINARY_INV,11,7)
 	img = cv2.blur(img,(2,2))
 	ret, img = cv2.threshold(img,img.mean(),255,cv2.THRESH_BINARY)
 	img = cv2.erode(img,kernel,1)
	return img

def detect(img):
	x,y = img.shape
	imgr = np.zeros(img.shape, np.uint8)
	a = [x/15,x/8,x/5]
	for t in range(3):
		boxsize = [a[t], a[t]]
		i = 0 
		j = 0
		nj = a[t]/8
		ni = a[t]/10
		while(1):
			crop_img = img[j:j+boxsize[1],i:i+boxsize[0]]
			i = i + ni
			if i>img.shape[1]-boxsize[0]:
				i = 0
				j = j + nj
				state = 1
				if j>img.shape[0]-boxsize[1]:
					break
			if(np.sum(crop_img) <= 2550):
				continue
			q =div_test_dnn(crop_img)
			if q == 1:
				imgr[j:j+boxsize[1],i:i+boxsize[0]] = 255				
	imgr, contours, hierarchy = cv2.findContours(imgr,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
	result = []
	i = 0
	for contour in contours:
		x,y,w,h = cv2.boundingRect(contour)
		result.append([x,y,w,h])
		i = i + 1
	return result
	
def recognize(img, contours):
	result = {}
	i = 0
	for contour in contours:
		[x,y,w,h] = contour
		crop_img = img[y:y+h,x:x+w]
		crop_img = preprocess_drop(crop_img)
		crop_img, cnts, hierarchy = cv2.findContours(crop_img,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
		for cnt in cnts:
			a,b,c,d = cv2.boundingRect(cnt)
			if c<=x/18 and d<=y/18:
				continue
			numimg = crop_img[b:b+d,a:a+c]
			xr = float(c)/(c+d)
			yr = float(d)/(c+d)
			num = detect_test_dnn(numimg,xr,yr)
			if num != -1:
				result.update({i:{'val':num,'x':(float(x+a)/imgx),'y':(float(y+b)/imgy),'w':(float(c)/imgx),'h':(float(d)/imgy)}})
				i = i + 1
	return result

def init():
	model = load_model(abs_path + '/dnn_params.h5')
	model.compile(loss='categorical_crossentropy',optimizer='adadelta',metrics=['accuracy'])
	graph = tf.get_default_graph()
	return model, graph
def initdiv():
	modeldiv = load_model(abs_path + '/dnn_params_div.h5')
	modeldiv.compile(loss='categorical_crossentropy',optimizer='adadelta',metrics=['accuracy'])
	graphdiv = tf.get_default_graph()
	return modeldiv, graphdiv

model,graph = init()
modeldiv, graphdiv = initdiv()
def find(img_url):
	global imgx,imgy
	image = cv2.imread(im_path+'/'+img_url,cv2.IMREAD_GRAYSCALE)
	image,imgx,imgy = scale_down(image)
	img = preprocess(image)
	contours = detect(img)
	results = recognize(image,contours)
	results.update({'image':{'x':imgx,'y':imgy}});
	results.update({'imagename': img_url});
	return results

def learn_model(imgurl,x,y,w,h,val):
	image = cv2.imread(im_path+'/'+imgurl,cv2.IMREAD_GRAYSCALE)
	image, imgx, imgy = scale_down(image)
	print x,y
	x = int(x*imgx)
	y = int(y*imgy)
	w = int(w*imgx)
	h = int(h*imgy)
	xr = float(w)/(w+h)
	yr = float(h)/(w+h)
	img = image[y:y+h,x:x+w]
	img = preprocess_num(img)
	cv2.imwrite(im_path + '/new/' + imgurl + '-' + str(val) + '.jpg',img)
	img = mnist_scale(img,xr,yr)
	y = np.zeros((1,10))
	y[0][val] = 1
	with graphdiv.as_default():
		model.fit(img,y,nb_epoch=5, batch_size=1, verbose=1)
	return 'ok'
