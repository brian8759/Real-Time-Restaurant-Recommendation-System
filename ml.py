import json
import sys 
import zerorpc
import numpy as np
from sklearn.neighbors import NearestNeighbors
reload(sys) 
sys.setdefaultencoding('utf8')

categories_dict={'Thai':1,'Chinese':2,'Italian':3,'French':4,'American':5}


f=open('yelp_academic_dataset_business.json','r')
count = 0 
restaurants=list()
while(count<4000):
    line=f.readline()
    d = json.loads(line)
    if(d['city']=='Phoenix'):
        temp=dict()
        temp['name']=d['name']
        temp['full_address']=d['full_address']
        temp['latitude']=d['latitude']
        temp['longitude']=d['longitude']
        temp['stars']=d['stars']
        temp['review_count']=d['review_count']
        for cate1 in d['categories']:
            if( cate1 in categories_dict.keys()):
                temp['categoty']=categories_dict[cate1]
                restaurants.append(temp)
                break
        count+=1
knnData=np.zeros((len(restaurants),2))
for index in range(0,len(restaurants)):
    knnData[index][0]=restaurants[index]['categoty']*100
    knnData[index][1]=restaurants[index]['review_count']

features='100,300'
nbrs = NearestNeighbors(n_neighbors=10, algorithm='ball_tree').fit(knnData)
distances, indices = nbrs.kneighbors([features.split(',')[0],features.split(',')[1]])
#print indices
selectedRestaurants=list()
for line in indices[0]:
    selectedRestaurants.append(restaurants[line])
print selectedRestaurants