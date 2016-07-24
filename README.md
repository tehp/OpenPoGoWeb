# OpenPoGoBotWebView
Web Viewer for OpenPoGoBot  

## Installation and Use
You can either download this as a zip and place it in the ``web/`` folder of PoGoBot, or the recommended way is to use git.  
[You can download git here](https://git-scm.com/download)  
If you are using git use the following commands to clone into the ``web/`` folder:  
```
$ cd PoGoBot  
$ git clone git@github.com:Reaver01/OpenPoGoBotWebView.git web  
$ cd web  
$ cp userdata.js.example userdata.js
```  

Make sure you edit your userdata.js file to reflect your preferences  
YOU WILL NEED A GOOGLE MAPS API KEY   [Get one here](https://developers.google.com/maps/documentation/javascript/get-api-key)  

If you want to serve this as a page you will have to use the following:  
```
$ cd PoGoBot\web  
$ python -m SimpleHTTPServer
```  

This will enable you to view your page on [http://localhost:8000](http://localhost:8000)  

## Contributing
If you would like to contribute please let me know and submit a pull request with COMPLETE TESTED features only.
