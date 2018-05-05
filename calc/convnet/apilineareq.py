import cv2
import numpy as np
from scipy.io import loadmat
from keras.models import load_model
from keras.optimizers import SGD
from PIL import Image
import os
from scipy.io import loadmat, savemat
from django.conf import settings
import tensorflow as tf
im_path = os.path.join(settings.BASE_DIR, 'media')
abs_path = os.path.join(settings.BASE_DIR, 'ai')
global model, graph
global modeldiv, graphdiv
global imgx,imgy
blankim = np.zeros((28,28))
kernel = np.ones((2,2),np.uint8)

rotateDict = {
	1:'rotate(0deg)',
	2:'rotate(0deg)',
	3:'rotate(180deg)',
	4:'rotate(0deg)',
	5:'rotate(0deg)',
	6:'rotate(90deg)',
	7:'rotate(0deg)',
	8:'rotate(-90deg)',
}
flipDict = {
	1:0,
	2:0,
	3:0,
	4:0,
	5:0,
	6:1,
	7:0,
	8:1,
}
digits = {
	0:'0',
	1:'1',
	2:'2',
	3:'3',
	4:'4',
	5:'5',
	6:'6',
	7:'7',
	8:'8',
	9:'9',
	10:'a',
	11:'b',
	12:'c',
	13:'x',
	14:'y',
	15:'z',
	16:'+',
	17:'-',
}
digits_rev = {
	'0':0,
	'1':1,
	'2':2,
	'3':3,
	'4':4,
	'5':5,
	'6':6,
	'7':7,
	'8':8,
	'9':9,
	'a':10,
	'b':11,
	'c':12,
	'x':13,
	'y':14,
	'z':15,
	'+':16,
	'-':17,
}
alpha = {
	0:'0',
	1:'1',
	2:'2',
	3:'3',
	4:'4',
	5:'5',
	6:'6',
	7:'7',
	8:'8',
	9:'9',
	10:'x',
	11:'+',
	12:'-',
}

alpha_rev = {
	'0':0,
	'1':1,
	'2':2,
	'3':3,
	'4':4,
	'5':5,
	'6':6,
	'7':7,
	'8':8,
	'9':9,
	'x':10,
	'+':11,
	'-':12,
}
def mnist_scale(img,xr,yr,a):
    x = int(a*xr)
    y = int(a*yr)
    if x<=0:
    	return None
    elif y<=0:
    	y = 1
    if x>=28:
    	x = 27
    if y>=28:
    	y = 27
    xg = (a-x)/2
    yg = (a-y)/2
    img = Image.fromarray(img)
    img = img.resize((x,y),Image.BICUBIC)
    img = np.asarray(img, dtype=np.uint8)
    imgb = np.copy(blankim)
    imgb[yg:yg+y,xg:xg+x] = img
    imgb = imgb.reshape((28, 28, 1)).astype('float32')
    imgb = np.array([imgb])
    return imgb

def conf_test_dnn(img,xr,yr):
	n_classes = 13
	imgb = mnist_scale(img,xr,yr,30)
	if imgb is None:
		return -1
	imgb = imgb/255
	with graphc.as_default():
		out = modelc.predict(imgb).reshape(n_classes)
	return np.argmax(out)

def char_test_dnn(img,xr,yr):
	n_classes = 18
	imgb = mnist_scale(img,xr,yr,28)
	if imgb is None:
		return -1
	imgb = imgb/255
	with graphd.as_default():
		out = modeld.predict(imgb).reshape(n_classes)
	return np.argmax(out)

def div_test_dnn(img):
	n_classes = 2
	img = Image.fromarray(img)
	img = img.resize((28,28),Image.BICUBIC)
	img = np.asarray(img, dtype=np.uint8)
	img = img.reshape((28, 28, 1)).astype('float32')
	img = np.array([img])
	img = img/255
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
			numimg = crop_img[b:b+d,a:a+c]
			xr = float(c)/(c+d)
			yr = float(d)/(c+d)
			if  ((xr>=0.4 and xr<=0.6 or yr>=0.4 and yr<=0.6) and (np.sum(numimg) >= (255*(d*c-d/10)))) or ( c<=(3*d) and (c<=w/20 and d<=h/20)):
				continue
			num = char_test_dnn(numimg,xr,yr)
			if (num<9 or num == 13 or num == 16 or num == 17):
				num = conf_test_dnn(numimg,xr,yr)
				num = alpha[num]
			else:
				num = digits[num]
			result.update({i:{'val':num,'x':(float(x+a)/imgx),'y':(float(y+b)/imgy),'w':(float(c)/imgx),'h':(float(d)/imgy)}})
			i = i + 1
	return result

def init_conf():
	modelc = load_model(abs_path + '/digits.h5')
	sgd = SGD(lr = 0.01, momentum = 0.9, decay = 0, nesterov = False)
	modelc.compile(optimizer=sgd, loss = 'categorical_crossentropy')
	graphc = tf.get_default_graph()
	return modelc, graphc
def init_char():
	modeld = load_model(abs_path + '/all.h5')
	sgd = SGD(lr = 0.01, momentum = 0.9, decay = 0, nesterov = False)
	modeld.compile(optimizer=sgd, loss = 'categorical_crossentropy')
	graphd = tf.get_default_graph()
	return modeld, graphd
def initdiv():
	modeldiv = load_model(abs_path + '/divider.h5')
	sgd = SGD(lr = 0.01, momentum = 0.9, decay = 0, nesterov = False)
	modeldiv.compile(optimizer=sgd, loss = 'categorical_crossentropy')
	graphdiv = tf.get_default_graph()
	return modeldiv, graphdiv

modelc,graphc = init_conf()
modeld,graphd = init_char()
modeldiv, graphdiv = initdiv()
def api_find_linear(img_url):
	global imgx,imgy
	image = cv2.imread(im_path+'/'+img_url,cv2.IMREAD_GRAYSCALE)
	imtmp = Image.open(im_path+'/'+img_url)
	image,imgx,imgy = scale_down(image)
	img = preprocess(image)
	contours = detect(img)
	results = recognize(image,contours)
	results.update({'image':{'x':imgx,'y':imgy,'angle':rotateDict[1],'flip':flipDict[1]}})
	results.update({'imagename': img_url})
	return results

def learnmat(filename,imgx,val):
	print 'got here'
	try:
		data = loadmat(abs_path + '/data/' + filename)
		x = data['X']
		y = data['y'][0]
		s = x.shape[0]
		xn = np.zeros((s+1,784))
		yn = np.zeros((s+1))
		xn[0:s] = x
		yn[0:s] = y
	except:
		xn = np.zeros((1,784))
		yn = np.zeros((1))
		s = 0
	xn[s] = imgx.flatten()
	yn[s] = val
	savemat(abs_path + '/data/' + filename[0:-4],{'X':xn,'y':yn})

def api_learn_model(imgurl,x,y,w,h,val):
	classesd = 18
	classesc = 13
	image = cv2.imread(im_path+'/'+imgurl,cv2.IMREAD_GRAYSCALE)
	image, imgx, imgy = scale_down(image)
	x = int(x*imgx)
	y = int(y*imgy)
	w = int(w*imgx)
	h = int(h*imgy)
	xr = float(w)/(w+h)
	yr = float(h)/(w+h)
	img = image[y:y+h,x:x+w]
	img = preprocess_drop(img)
	img = mnist_scale(img,xr,yr,28)
	img = img.reshape((28,28))
	img = img.reshape((28, 28, 1)).astype('float32')
	img = np.array([img])
	img = img/255
	learnmat('all.mat',img, alpha_rev[val])
	learnmat('some.mat',img, digits_rev[val])
	return 'ok'
