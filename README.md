# OpenPoGoBotWeb
Web View for OpenPoGoBot  

## Installation and Use
You can either download this as a zip and place it in the ``web/`` folder of PoGoBot, or use git, which we recommend.
[You can download git here](https://git-scm.com/download)  
If you are using git use the following commands to clone this project into the ``web/`` folder of OpenPoGoBot:  
```
$ cd OpenPoGoBot  
$ git clone git@github.com:OpenPoGo/OpenPoGoWeb.git  
$ cd web  
$ cp userdata.js.example userdata.js
```  

Make sure you edit your userdata.js file to reflect your preferences  
YOU WILL NEED A GOOGLE MAPS API KEY   [Get one here](https://developers.google.com/maps/documentation/javascript/get-api-key)  

If you want to serve this as a webpage you will have to set up a webserver, for example:

```
$ cd OpenPoGoBot\web  
$ python -m SimpleHTTPServer
```  

This will enable you to view your page on [http://localhost:8000](http://localhost:8000)  

## Contributing
If you would like to contribute please review OpenPoGo's [contributing](https://github.com/OpenPoGo/OpenPoGoBot/blob/master/CONTRIBUTING.md) guidelines and submit a pull request
