import json
import sys 
import zerorpc
import numpy as np
from sklearn.cluster import KMeans
from random import randint
reload(sys) 
sys.setdefaultencoding('utf8')

categories_dict={'Thai':1,'Chinese':2,'Italian':3,'French':4,'American':5}

xishu=100

class HelloRPC(object):
    def stastic(self,testpoint,dataset):
        categotyDeviation=0
        reviewDeviation=0
        totalDeviation=0
        for item in dataset:
            categotyDeviation = categotyDeviation+((item['categoty']*xishu-int(testpoint[0]))**2)
            reviewDeviation = reviewDeviation+((item['review_count']-int(testpoint[1]))**2)
            #print item['categoty']*xishu,int(testpoint[0]),item['review_count'],int(testpoint[1])
        totalDeviation = (categotyDeviation+reviewDeviation)

        #print categotyDeviation/10,reviewDeviation/10,totalDeviation/10

    def hello(self,features):
        mylongitude=float(features.split(',')[3])
        mylatitude=float(features.split(',')[2])
        f=open('yelp_academic_dataset_business.json','r')
        count = 0 
        restaurants=list()
        newdict=dict()
        line=f.readline()
        while(line):
            #print count
            d = json.loads(line)
            if(d['city']=='Las Vegas'):
            	temp=dict()
            	temp['name']=d['name']
            	temp['full_address']=d['full_address']
            	temp['latitude']=d['latitude']
            	temp['longitude']=d['longitude']
            	temp['stars']=d['stars']
            	temp['review_count']=d['review_count']
                temp['distance']=(temp['longitude']-mylongitude)*(temp['longitude']-mylongitude)+(temp['latitude']-mylatitude)*(temp['latitude']-mylatitude)
            	temp['expense']=randint(1,4)
                temp['time']=0
                temp['ranking']=0
                for cate1 in d['categories']:
                    if( cate1 in categories_dict.keys()):
                        temp['categoty']=categories_dict[cate1]
                        restaurants.append(temp)
                        break      
                         
            line=f.readline()
        #print 'lenth of res is',len(restaurants)
        
        kmeanData=np.zeros((len(restaurants),2))
        for index in range(0,len(restaurants)):
            kmeanData[index][0]=restaurants[index]['categoty']*xishu
            kmeanData[index][1]=restaurants[index]['review_count']

        learner=KMeans(n_clusters=7)
        learner.fit(kmeanData)
        labels = learner.labels_
        mylabel=learner.predict([int(features.split(',')[0])*xishu,int(features.split(',')[1])])

        #nbrs = NearestNeighbors(n_neighbors=50, algorithm='ball_tree').fit(kmeanData)
        #distances, indices = nbrs.kneighbors([features.split(',')[0],features.split(',')[1]])
        selectedRestaurants=list()
        for i in range(0,len(restaurants)):
            if(mylabel==labels[i]):
                #print mylabel,labels[i],'\n'
                selectedRestaurants.append(restaurants[i])

        distanceSort = sorted(selectedRestaurants, key=lambda k: k['distance'])

        starsSort = sorted(selectedRestaurants, key=lambda k: k['stars'],reverse=True)

        for item in selectedRestaurants:
            #print distanceSort.index(item),'+',starsSort.index(item),'=',0.5*distanceSort.index(item)+0.5*starsSort.index(item)
            item['ranking']=0.5*distanceSort.index(item)+0.5*starsSort.index(item)


        restaurantssortedByRanking=sorted(selectedRestaurants, key=lambda k: k['ranking'])

        self.stastic([int(features.split(',')[0])*xishu,int(features.split(',')[1])],restaurantssortedByRanking[0:10])

        return restaurantssortedByRanking[0:10]


s = zerorpc.Server(HelloRPC())
s.bind("tcp://0.0.0.0:4242")
s.run()