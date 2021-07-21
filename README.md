# AZNH_Demo
##Android phone + react native + azure notification

config azure connection string:
edit ./config.js


download `google-services.json` from firebase project
move to `./andorid/app/google-services.json`

run react native on andorid:
`cd ./tmpn_poc`

install required libs
`npm install`

run
`npm run andorid`

push
`cd ./bkend`

install required libs
`npm install`

run
`node push.js`
