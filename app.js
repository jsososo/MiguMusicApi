const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs');
const cheerio = require("cheerio");
const request = require('./util/request');
const StringHelper = require('./util/StringHelper');
const SongUrlSaver = require('./util/SongUrl');
const DataStatistics = require('./util/dataStatistics');

const app = express();
const UrlSaver = new SongUrlSaver();
const dataHandle = new DataStatistics();
global.dataStatistics = dataHandle;

setInterval(() => UrlSaver.write(), 3600000 * 3);

// 每5分钟存一下数据
setInterval(() => dataHandle.saveInfo(), 60000 * 5);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => dataHandle.record(req, res, next));

fs.readdirSync(path.join(__dirname, 'routes')).reverse().forEach(file => {
  const filename = file.replace(/(\.js|\.ts)$/, '');
  app.use(`/${filename}`, (req, res, next) => {
    const router = express.Router();
    req.query = {
      ...req.query,
      ...req.body,
    };
    const RouterMap = require(`./routes/${filename}`);
    Object.keys(RouterMap).forEach((path) => {
      let rObj = RouterMap[path];
      if (typeof rObj === 'function') {
        rObj = {
          func: rObj,
          post: true,
          get: true,
        }
      }
      const func = (req, res, next) => rObj.func({
        req,
        res,
        next,
        request: new request({ req, res, next }),
        cheerio,
        ...StringHelper,
        UrlSaver,
      });
      if (rObj.post) {
        router.post(path, func);
      }
      if (rObj.get) {
        router.get(path, func);
      }
    });
    router(req, res, next);
  });
});

app.use('/', require('./routes/index'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
