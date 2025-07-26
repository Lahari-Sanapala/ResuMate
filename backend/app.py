from flask import Flask
from routes.upload import upload_bp
from routes.improve import improve_bp
from routes.summary import summary_bp          
from routes.keyword_matcher import matcher_bp  
from routes.download import download_bp 

app = Flask(__name__)

# Register blueprints
app.register_blueprint(upload_bp, url_prefix='/api')
app.register_blueprint(improve_bp, url_prefix='/api')
app.register_blueprint(summary_bp, url_prefix='/api')      
app.register_blueprint(matcher_bp, url_prefix='/api')  
app.register_blueprint(download_bp, url_prefix='/api')


if __name__ == '__main__':
    app.run(debug=True)
