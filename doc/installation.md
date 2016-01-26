![J316 Translator](logo.png)

# J316 Translator Installation

There are many ways how you can get the application working. The easiest way is to use a docker based heroku.com platform.
The only requirement is to register a account there. The free account is absolutely enough and has only one impact that the container will sleep regulary if no users use it. But it is 
not a problem. 

The other and more professional way is to use search infrastructure solutions as dokku or deis. 
The configuration of them is out of scope of this documentation.

You can also run the application on bare metal with simply installing NodeJS on the machine. It is up to your knowledge and needs how you are going to run it. 

## Running in Heroku container

To run the application in a heroku under a address like <yourname>.herokuapp.com you need to do following steps:

*   Go to your heroku Dashboard
*   Click "+" to add a new application and provide name (for example test-j316) as well as a hosting place for it (Europe)
*   Download and install the Heroku Toolbelt from the link on the page you see.
*   Log in to your Heroku account and follow the prompts to create a new SSH public key.
*   Checkout the j316-translator repository from github locally with `git clone https://github.com/lagranovskiy/j316-translator.git` 
*   Add a heroku as a remote git repository with `heroku git:remote -a <application name like 'test-j316'>`
*   Push the application to Heroku with `git push heroku master`

After you deployed the application it doesnt work because there are still no configuration provided. 
Please refer to the description of env variables and set them on your Heroku app using Settings/Reveal Config Vars section.
 There you can add/remove/modify env variables and so control the application

## Running locally

*   Checkout the j316-translator repository from github locally with `git clone https://github.com/lagranovskiy/j316-translator.git` 
*   You can simply run the application locally on your machine or server by running `node index.js` in the root folder of repo.
*   You need to provide env variables as described in a next section as a command line parameters or env. variables on the machine to get application work

Running locally/on server is a simpliest way to start the application, but make it more complex to configure it.

## Environment Variables for configuration
There are some environment variables that need to be set in order to get the application running.
You can provide them as a command line parameters, as a env vars on a container or on a host server.

| Variable Name | Default Value | Required| Description |
| ------------- |-------------- | --------| ----------- |
| APPLICATION_NAME | J316-Translator | o | Default technical application name |
| APPLICATION_BRAND | Gemeinde Teststadt | x | Name of the organization the application belongs to. It will be displayed |
| BRAND_CONTACT | Max Mustermann (0176 123 45 56) | o | Accountable person for a contact (not used yet) |
| ACCESS_KEY | j316 | o | the key for accessing the translator ui |
| REDIS_URL | redis://192.168.99.100:32770 | x | Connection URL to Redis DB instance for session data replication |
| SESSION_SECRET | mysecret | o | Encryption key |
| MAX_IDLE_TIME | 30 | o | Max time in Minutes as a client may wait for a sender (min) |
| MAX_INACTIVE_TIME | 30 | o | Time after all client are forced to logout after translation activity closed (min) |
| CLUSTER_MODE | false | o | If the server need to synchnorize socket communication over the cluster |
| HOST | localhost | o | host name for binding |
| PORT | 1080 | o | Port for binding  |
| NEWRELIC_KEY | test | o | Key of the monitoring system newrelic.com (is free) |
| YANDEX_TRANSLATE_KEY | dummy | x | Access key of the yandex translation service |
| DBT_KEY | dummy | x | Access key of the bible lookup  service |


## Backing Services
### Newrelic
Newrelic is a monitoring tool that is integrated in the translator.
If you want to use it, please register on newrelic.com and get a key you can provide in the `NEWRELIC_KEY` env var.

### Redis
Redis DB Is used to store the session data of users and prevent loose of connection configuration by server/user problems.
Please provide a connection URL to your redis instance in the `REDIS_URL` variable.
You can use it on many ways:

* Run it locally as a docker container like `https://hub.docker.com/_/redis/`
* Run it on bare metall by installing it from the redis official site
* Use heroku addon Redmin or other that provide a cloud base solution that is usually free for such minimalistic usage

### Yandex Translate API
The most important variable to be set is `YANDEX_TRANSLATE_KEY`. To get it go to `https://tech.yandex.com/keys/get/?service=trnsl` and sing up for a free usage key.
The key you get will look like: `trnsl.1.1.20160126T093845Z.f7841d1d5121abe6.1ac49630ffe8a31cd77a7097ea869051ce`. It is very important to provide it because no
translation will be possible without it

### Bible API
If you need to use a bible verses lookup, then you need to provide a digitalbibleplatform.com api key.
To get it you need to register on that resource under http://www.digitalbibleplatform.com/dev/signup/ and provide information about 
for what aim do you need access to the platform. The platform is free, but they want to know who uses it and for which aim.
As far you get the key, provide it as a environment variable `DBT_KEY`

### Questions
If you still habe questions/problems please fill free to contact me per email j316@agranovskiy.de.