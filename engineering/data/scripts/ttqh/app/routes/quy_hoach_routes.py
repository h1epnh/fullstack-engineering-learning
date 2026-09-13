from flask import Flask, jsonify
from app.services import api_service, data_service
from app import db, config

app = Flask(__name__)
app.config.from_object(config.Config) #Loads configuration parameters from the class Config to the app

@app.route("/quy_hoach/<mathuadat>") #Setting the app route
def get_quy_hoach(mathuadat): #mathuadat parameter
  """GET quy hoach endpoint for the route"""
  conn = db.get_db_connection()
  db_data = db.fetch_quy_hoach_data(conn, mathuadat)
  if db_data:
    return jsonify(db_data)
  api_data = api_service.get_quy_hoach_data(mathuadat, app.config['API_URL'])
  if not data_service.validate_quy_hoach_data(api_data): #Validate data
    return "Bad info!", 400
  return jsonify(api_data) #The api will return a json with the data