from flask import Flask,render_template,request
from flask_restful import Resource, Api
from flask_cors import CORS, cross_origin
import json
import pandas as pd
import sklearn
from sklearn.cluster import KMeans
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/templates')
def index():
    return render_template("index.html")
    
@app.route('/corrw')
@cross_origin()
def corrWine():
    cluster = request.args.get("cluster")
    c=pd.read_csv('static/winequality-red.csv')
    c=c.iloc[0:,0:11]
    kmeans=KMeans(random_state=0)
    clf=kmeans.fit_predict(c)
    c['cluster']=clf  
    columns = list(c.columns)
    columns.pop()
    df_corr = c.loc[c['cluster'] == int(cluster)][columns].corr()
    outputObj = {}
    outputObj['columns']=columns
    outputObj['data']=df_corr.to_json(orient='values')
    return json.dumps(outputObj)
   

@app.route('/corri')
@cross_origin()
def corrIris():
    cluster = request.args.get("cluster")
    c=pd.read_csv('static/iris.csv')
    c=c.iloc[0:,0:4]
    kmeans=KMeans(random_state=0)
    clf=kmeans.fit_predict(c)
    c['cluster']=clf  
    columns = list(c.columns)
    columns.pop()
    df_corr = c.loc[c['cluster'] == int(cluster)][columns].corr()
    outputObj = {}
    outputObj['columns']=columns
    outputObj['data']=df_corr.to_json(orient='values')
    return json.dumps(outputObj)
 

@app.route('/wine')
@cross_origin()
def wineData():
    n_clusters = request.args.get("n_clusters")
    type = request.args.get("type")
    if type == 'class':
        print("class")
        c = pd.read_csv('static/winequality-red.csv')
        return c.to_json(orient='records')
    else:
        print("cluster")
        c=pd.read_csv('static/winequality-red.csv')
        c=c.iloc[0:,0:11]
        n_clusters = int(n_clusters)
        kmeans=KMeans(n_clusters=n_clusters,random_state=0)
        clf=kmeans.fit_predict(c)
        c['cluster']=clf  
        return c.to_json(orient='records')     

@app.route('/iris')
@cross_origin()
def irisData():
    type = request.args.get("type")
    n_clusters = request.args.get("n_clusters")
    print(n_clusters)
    if type=='class':
        print("class")
        c= pd.read_csv('static/iris.csv')
        return c.to_json(orient='records')
    else:
        c=pd.read_csv('static/iris.csv')
        c=c.iloc[0:,0:4]
        n_clusters = int(n_clusters)
        classifier=KMeans(n_clusters=n_clusters,random_state=0)
        clf1=classifier.fit_predict(c)
        c['cluster']=clf1
        return c.to_json(orient='records')

